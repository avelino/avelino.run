#!/usr/bin/env bb

(require '[clojure.string :as str]
         '[babashka.fs :as fs]
         '[cheshire.core :as json]
         '[babashka.process :refer [shell]])

(def base-url "https://avelino.run")
(def blog-dir "content/blog")
(def quote-dir "content/quote")
(def outbox-file "static/outbox")
(def content-dir "static/content")

(defn ensure-dir
  "Ensure directory exists"
  [dir]
  (when-not (fs/exists? dir)
    (fs/create-dirs dir)))

(defn bytes-to-hex
  "Convert byte array to hex string"
  [bytes]
  (str/join (map #(format "%02x" %) bytes)))

(defn generate-hash
  "Generate a hash for the content."
  [title date]
  (let [content (str title date)
        md (java.security.MessageDigest/getInstance "MD5")
        bytes (.getBytes content "UTF-8")]
    (bytes-to-hex (.digest md bytes))))

(defn parse-date
  "Parse date string to java.time.LocalDate"
  [date-str]
  (java.time.LocalDate/parse (str/replace date-str #"\"" "")))

(defn format-date
  "Format date to ISO format, handling various formats and ensuring not future date"
  [date-str]
  (let [current-date (java.time.LocalDate/now)
        current-date-str (.toString current-date)
        current-date-iso (str current-date-str "T00:00:00+00:00")]
    (try
      (let [; Clean the date string, handling various formats
            clean-date (cond
                         ; Handle empty date
                         (str/blank? date-str)
                         current-date-str

                         ; Handle TOML format like: date = "2018-05-16"
                         (re-find #"=\s*\"([^\"]+)\"" (str date-str))
                         (second (re-find #"=\s*\"([^\"]+)\"" (str date-str)))

                         ; Handle quoted string like: "2018-05-16"
                         (re-find #"^\"([^\"]+)\"$" (str date-str))
                         (second (re-find #"^\"([^\"]+)\"$" (str date-str)))

                         ; Handle date with time like: 2020-05-09T06:00:00Z
                         (re-find #"^(\d{4}-\d{2}-\d{2})T" (str date-str))
                         (second (re-find #"^(\d{4}-\d{2}-\d{2})T" (str date-str)))

                         ; Default: use as is if it looks like a date
                         (re-find #"^\d{4}-\d{2}-\d{2}$" (str date-str))
                         (str date-str)

                         ; Fallback to current date
                         :else current-date-str)]

            ; Check if date is in the future
        (try
          (let [parsed-date (java.time.LocalDate/parse clean-date)]
            (if (.isAfter parsed-date current-date)
              current-date-iso
              (str clean-date "T00:00:00+00:00")))
          (catch Exception e
            (println "Warning: Cannot parse date:" date-str "- using current date")
            current-date-iso)))
      (catch Exception e
        (println "Error processing date:" date-str "- using current date")
        current-date-iso))))

(defn extract-frontmatter
  "Extract frontmatter from markdown file"
  [file-path]
  (let [content (slurp file-path)
        ; Try both TOML (+++) and YAML (---) frontmatter formats
        pattern-toml (re-pattern "(?s)^\\+\\+\\+\\s*(.+?)\\+\\+\\+\\s*(.*)$")
        pattern-yaml (re-pattern "(?s)^---\\s*(.+?)---\\s*(.*)$")
        matches-toml (re-find pattern-toml content)
        matches-yaml (re-find pattern-yaml content)
        matches (or matches-toml matches-yaml)]
    (if matches
      (let [frontmatter (str/trim (nth matches 1))
            content (str/trim (nth matches 2))
            ; Check if it's TOML format (with =) or YAML format (with :)
            is-toml (str/includes? frontmatter "=")
            ; Process according to format
            metadata (if is-toml
                       ; Process TOML format (with =)
                       (reduce (fn [acc line]
                                 (let [parts (str/split line #"=")]
                                   (if (= (count parts) 2)
                                     (let [key (str/trim (first parts))
                                           value (str/trim (second parts))]
                                       ; Extract value from quotes if present
                                       (assoc acc (keyword key)
                                              (if (re-find #"^\".*\"$" value)
                                                (str/replace value #"^\"(.*)\"$" "$1")
                                                value)))
                                     acc)))
                               {}
                               (str/split frontmatter #"\n"))
                       ; Process YAML format (with :)
                       (reduce (fn [acc line]
                                 (let [parts (str/split line #":")]
                                   (if (>= (count parts) 2)
                                     (let [key (str/trim (first parts))
                                           ; Join remaining parts in case value contains colons
                                           value (str/trim (str/join ":" (rest parts)))]
                                       ; Extract value from quotes if present
                                       (assoc acc (keyword key)
                                              (if (re-find #"^\".*\"$" value)
                                                (str/replace value #"^\"(.*)\"$" "$1")
                                                value)))
                                     acc)))
                               {}
                               (str/split frontmatter #"\n")))]
        {:metadata metadata
         :content content})
      {:metadata {}
       :content content})))

(defn get-slug
  "Get slug from post metadata, using url if slug is not present"
  [metadata]
  (let [url (get metadata :url "")
        clean-url (if (str/starts-with? url "/")
                    (subs url 1)
                    url)
        clean-url (str/replace clean-url #"\"" "")
        clean-url (str/replace clean-url #"/+" "/")]
    clean-url))

(defn clean-markdown
  "Clean markdown content by removing markdown syntax"
  [content]
  (-> content
      (str/replace #"!\[([^\]]+)\]\([^\)]+\)" "") ; Remove images
      (str/replace #"\[([^\]]+)\]\([^\)]+\)" "$1") ; Replace links with text
      (str/replace #"\*\*([^\*]+)\*\*" "$1") ; Remove bold
      (str/replace #"\*([^\*]+)\*" "$1") ; Remove italic
      (str/replace #"#+ (.+)" "$1") ; Remove headers
      (str/replace #"`([^`]+)`" "$1") ; Remove code
      (str/replace #"\"" "") ; Remove quotes
      (str/replace #"^\s*!\s*" "") ; Remove leftover image markers
      (str/trim)))

(defn fix-url
  "Fix URL by removing double slashes except after protocol"
  [url]
  (str/replace url #"(?<!:)/+" "/"))

(defn process-post
  "Process a single post and return its metadata and content"
  [file-path]
  (let [post (extract-frontmatter (str file-path))
        title (get-in post [:metadata :title] "")
        date (get-in post [:metadata :date] "")
        tags (get-in post [:metadata :tags] [])
        tags-list (if (coll? tags) tags [])
        slug (get-slug (:metadata post))
        post-url (fix-url (str base-url "/" slug))
        published-date (format-date date)
        content (clean-markdown (:content post))
        is-quote (or (and (coll? tags-list) (some #{"quote"} tags-list))
                     (str/includes? (str file-path) "quote/"))]

    {:title title
     :date published-date
     :tags tags-list
     :url post-url
     :content content
     :type (if is-quote "quote" "blog")
     :file-path (str file-path)}))

(defn create-activity
  "Create an ActivityPub activity for a blog post."
  [post base-url]
  (let [title (:title post)
        date (:date post)
        tags (:tags post)
        post-hash (generate-hash title date)
        post-url (:url post)
        ; Format the date for ActivityPub
        formatted-date date
        post-type (:type post)

        ; Create HTML content with hashtags
        hashtags (when (not (empty? tags))
                   (->> tags
                        (map #(str/replace % #"\"" ""))
                        (map #(str "#" (str/replace % #"\s+" "")))
                        (str/join " ")))
        html-content (if (= post-type "quote")
                       (str "<p><strong>" title "</strong></p>"
                            "<p>" (:content post) "</p>"
                            (when hashtags
                              (str "<p>" hashtags "</p>"))
                            "<p><a href='" post-url "'>" post-url "</a></p>")
                       (str "<p>" title "</p>"
                            (when hashtags
                              (str "<p>" hashtags "</p>"))
                            "<p><a href='" post-url "'>" post-url "</a></p>"))]

    {"@context" "https://www.w3.org/ns/activitystreams"
     "id" (str "/socialweb/notes/" post-hash "/create")
     "type" "Create"
     "actor" (fix-url (str base-url "/users/hey"))
     "to" ["https://www.w3.org/ns/activitystreams#Public"]
     "cc" []
     "published" formatted-date
     "object" {"@context" "https://www.w3.org/ns/activitystreams"
               "id" (str "/socialweb/notes/" post-hash)
               "type" "Note"
               "hash" post-hash
               "content" html-content
               "url" post-url
               "attributedTo" (fix-url (str base-url "/users/hey"))
               "to" ["https://www.w3.org/ns/activitystreams#Public"]
               "cc" []
               "published" formatted-date
               "tag" [{"type" "Mention"
                       "href" (fix-url (str base-url "/users/hey"))
                       "name" "@hey@avelino.run"}]
               "replies" {"id" (str "/socialweb/replies/" post-hash)
                          "type" "Collection"
                          "first" {"type" "CollectionPage"
                                   "next" (str "/socialweb/replies/" post-hash "?page=true")
                                   "partOf" (str "/socialweb/replies/" post-hash)
                                   "items" []}}}}))

(defn generate-content
  "Generate content for all posts"
  []
  (println "Generating content for all posts...")

  ; Ensure output directory exists
  (ensure-dir content-dir)

  ; Get all markdown files from both directories
  (let [blog-files (fs/glob blog-dir "*.md")
        quote-files (fs/glob quote-dir "*.md")
        quote-lifestyle-files (fs/glob (str quote-dir "/lifestyle") "*.md")
        all-files (concat blog-files quote-files quote-lifestyle-files)

        ; Process all posts
        posts (->> all-files
                   (map process-post)
                   (filter #(and (:title %) (:date %)))
                   (sort-by :date #(compare %2 %1)))

        ; Create content index
        content-index {:total-posts (count posts)
                       :blog-posts (count (filter #(= (:type %) "blog") posts))
                       :quote-posts (count (filter #(= (:type %) "quote") posts))
                       :posts posts}]

    ; Write content index file
    (spit (str content-dir "/index.json")
          (json/generate-string content-index {:pretty true}))

    ; Write individual post files
    (doseq [post posts]
      (let [filename (str/replace (:url post) #"^https://[^/]+/" "")
            file-path (str content-dir "/" filename ".json")]
        (ensure-dir (fs/parent file-path))
        (spit file-path (json/generate-string post {:pretty true}))))

    (println "Content generated successfully!")
    posts))

(defn generate-outbox
  "Generate outbox for ActivityPub"
  [posts]
  (println "Generating outbox...")

  ; Create outbox
  (let [outbox {"@context" "https://www.w3.org/ns/activitystreams"
                "id" "/socialweb/outbox"
                "type" "OrderedCollection"
                "summary" "Recent content on Thiago Avelino"
                "totalItems" (count posts)
                "orderedItems" (map #(create-activity % base-url) posts)}]

    ; Write outbox file
    (spit outbox-file (json/generate-string outbox {:pretty true}))
    (println "Outbox generated successfully!")))

(defn main
  "Main function to generate content and outbox."
  []
  (let [posts (generate-content)]
    (generate-outbox posts)))

(main)