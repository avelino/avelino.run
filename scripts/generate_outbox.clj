#!/usr/bin/env bb

(require '[clojure.string :as str]
         '[babashka.fs :as fs]
         '[cheshire.core :as json]
         '[babashka.process :refer [shell]])

(def base-url "https://avelino.run")
(def blog-dir "content/blog")
(def outbox-file "static/outbox")

(defn generate-hash
  "Generate a hash for the content."
  [content]
  (let [process (shell {:out :string} "echo" content "|" "md5sum" "|" "cut" "-d" " " "-f1")]
    (str/trim (:out process))))

(defn format-date
  "Format date to ISO 8601 format."
  [date-str]
  (try
    (let [date (java.time.LocalDate/parse date-str)]
      (str (.format date (java.time.format.DateTimeFormatter/ofPattern "yyyy-MM-dd")) "T00:00:00+00:00"))
    (catch Exception _
      nil)))

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
                                 (assoc acc (keyword (str/trim key)) (str/trim value))
                                 acc))
                             {}
                             (str/split-lines frontmatter))]
        {:metadata metadata
         :content content})
      {:metadata {} :content content})))

(defn create-activity
  "Create an ActivityPub activity for a blog post."
  [post base-url]
  (let [post-hash (generate-hash (:content post))
        post-url (str base-url "/" (get-in post [:metadata :slug] ""))
        title (get-in post [:metadata :title] "")
        content-lines (str/split-lines (:content post))
        first-paragraph (first (filter #(not (str/blank? %)) content-lines))

        ; Create HTML content
        html-content (str "<p>" title "</p>"
                          (when first-paragraph
                            (str "<p>" first-paragraph "</p>"))
                          "<p>Full article by <a href=\"" base-url "/users/hey\" class=\"u-url mention\">@<span>hey</span></a>: "
                          "<a href='" post-url "'>" post-url "</a></p><p></p>")]

    {"@context" "https://www.w3.org/ns/activitystreams"
     "id" (str "/socialweb/notes/" post-hash "/create")
     "type" "Create"
     "actor" (str base-url "/users/hey")
     "to" ["https://www.w3.org/ns/activitystreams#Public"]
     "cc" []
     "published" (format-date (get-in post [:metadata :date]))
     "object" {"@context" "https://www.w3.org/ns/activitystreams"
               "id" (str "/socialweb/notes/" post-hash)
               "type" "Note"
               "hash" post-hash
               "content" html-content
               "url" post-url
               "attributedTo" (str base-url "/users/hey")
               "to" ["https://www.w3.org/ns/activitystreams#Public"]
               "cc" []
               "published" (format-date (get-in post [:metadata :date]))
               "tag" [{"Type" "Mention"
                       "Href" (str base-url "/users/hey")
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
                            (when (get-in post [:metadata :date])
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