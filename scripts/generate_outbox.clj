#!/usr/bin/env bb

(require '[clojure.string :as str]
         '[babashka.fs :as fs]
         '[cheshire.core :as json]
         '[babashka.process :refer [shell]])

(def base-url "https://avelino.run")
(def blog-dir "content/blog")
(def outbox-file "static/outbox")

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

(defn format-date
  "Format date to ISO 8601 format."
  [date-str]
  (try
    (let [date (java.time.LocalDate/parse (str/replace date-str #"\"" ""))]
      (str (.format date (java.time.format.DateTimeFormatter/ofPattern "yyyy-MM-dd")) "T00:00:00+00:00"))
    (catch Exception _
      (str (.format (java.time.LocalDate/now) (java.time.format.DateTimeFormatter/ofPattern "yyyy-MM-dd")) "T00:00:00+00:00"))))

(defn extract-frontmatter
  "Extract frontmatter from markdown file."
  [file-path]
  (let [content (slurp file-path)
        parts (str/split content #"(?m)^---\s*$" 3)]
    (if (>= (count parts) 3)
      (let [frontmatter (second parts)
            content (nth parts 2)
            metadata (reduce (fn [acc line]
                               (if-let [[_ key value] (re-matches #"^([^:]+):\s*(.+)$" line)]
                                 (let [key (keyword (str/trim key))
                                       value (str/trim value)]
                                   (if (= key :tags)
                                     (assoc acc key (read-string value))
                                     (assoc acc key value)))
                                 acc))
                             {}
                             (str/split-lines frontmatter))]
        {:metadata metadata
         :content content})
      {:metadata {} :content content})))

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

(defn create-activity
  "Create an ActivityPub activity for a blog post."
  [post base-url]
  (let [title (get-in post [:metadata :title] "")
        date (get-in post [:metadata :date] "")
        tags (get-in post [:metadata :tags] [])
        post-hash (generate-hash title date)
        slug (get-slug (:metadata post))
        post-url (fix-url (str base-url "/" slug))
        published-date (format-date date)

        ; Create HTML content with hashtags
        hashtags (when (not (empty? tags))
                   (->> tags
                        (map #(str/replace % #"\"" ""))
                        (map #(str "#" (str/replace % #"\s+" "")))
                        (str/join " ")))
        html-content (str "<p>" (clean-markdown title) "</p>"
                          (when hashtags
                            (str "<p>" hashtags "</p>"))
                          "<p><a href='" post-url "'>" post-url "</a></p>")]

    {"@context" "https://www.w3.org/ns/activitystreams"
     "id" (str "/socialweb/notes/" post-hash "/create")
     "type" "Create"
     "actor" (fix-url (str base-url "/users/hey"))
     "to" ["https://www.w3.org/ns/activitystreams#Public"]
     "cc" []
     "published" published-date
     "object" {"@context" "https://www.w3.org/ns/activitystreams"
               "id" (str "/socialweb/notes/" post-hash)
               "type" "Note"
               "hash" post-hash
               "content" html-content
               "url" post-url
               "attributedTo" (fix-url (str base-url "/users/hey"))
               "to" ["https://www.w3.org/ns/activitystreams#Public"]
               "cc" []
               "published" published-date
               "tag" [{"Type" "Mention"
                       "Href" (fix-url (str base-url "/users/hey"))
                       "Name" "@hey@avelino.run"}]
               "replies" {"id" (str "/socialweb/replies/" post-hash)
                          "type" "Collection"
                          "first" {"type" "CollectionPage"
                                   "next" (str "/socialweb/replies/" post-hash "?page=true")
                                   "partOf" (str "/socialweb/replies/" post-hash)
                                   "items" []}}}}))

(defn main
  "Main function to generate outbox."
  []
  (println "Generating outbox...")

  ; Get all markdown files
  (let [files (fs/glob blog-dir "*.md")
        posts (->> files
                   (map (fn [file]
                          (let [post (extract-frontmatter (str file))]
                            (when (and (get-in post [:metadata :date])
                                       (get-in post [:metadata :title])
                                       (get-in post [:metadata :url]))
                              post))))
                   (filter some?)
                   (sort-by #(get-in % [:metadata :date]) #(compare %2 %1)))


        ; Create outbox
        outbox {"@context" "https://www.w3.org/ns/activitystreams"
                "id" "/socialweb/outbox"
                "type" "OrderedCollection"
                "summary" "Recent content on Thiago Avelino"
                "totalItems" (count posts)
                "orderedItems" (map #(create-activity % base-url) posts)}]

    ; Write outbox file
    (spit outbox-file (json/generate-string outbox {:pretty true}))
    (println "Outbox generated successfully!")))

(main)