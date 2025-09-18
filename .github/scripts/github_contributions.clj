#!/usr/bin/env bb

 (ns github-contributions
   (:require [babashka.curl :as curl]
             [babashka.fs :as fs]
             [clojure.string :as str]
             [clojure.java.io :as io]
             [cheshire.core :as json]
             [clojure.tools.cli :refer [parse-opts]]))

(def config
  {:github-username (or (System/getenv "GITHUB_USERNAME") "avelino")
   :github-token (or (System/getenv "GH_TOKEN") (System/getenv "GITHUB_TOKEN"))
   :base-dir "content/foss"})

(println "GitHub Token status:" (if (:github-token config) "Presente" "Ausente"))

(def headers
  (cond-> {"Content-Type" "application/json"}
    (:github-token config) (assoc "Authorization" (str "Bearer " (:github-token config)))))

;; Abort early if token is missing to avoid generating empty markdown
(when-not (:github-token config)
  (println "Erro: variável de ambiente GH_TOKEN ou GITHUB_TOKEN não encontrada.\nDefina seu token do GitHub e tente novamente, por exemplo:\n  export GH_TOKEN=seu_token      # ou\n  export GITHUB_TOKEN=seu_token")
  (System/exit 1))

(def github-graphql-url "https://api.github.com/graphql")
(def github-rest-base-url "https://api.github.com")

(defn format-date [date]
  (let [formatter (java.time.format.DateTimeFormatter/ofPattern "yyyy-MM-dd'T'HH:mm:ss'Z'")]
    (.format formatter date)))

(defn parse-date [date-str]
  (let [iso-formatter (java.time.format.DateTimeFormatter/ofPattern "yyyy-MM-dd'T'HH:mm:ss'Z'")
        local-formatter (java.time.format.DateTimeFormatter/ofPattern "yyyy-MM-dd HH:mm")
        iso? (str/includes? date-str "T")]
    (if iso?
      (let [local-dt (java.time.LocalDateTime/parse date-str iso-formatter)]
        (java.time.ZonedDateTime/of local-dt java.time.ZoneOffset/UTC))
      (let [local-dt (java.time.LocalDateTime/parse date-str local-formatter)]
        (java.time.ZonedDateTime/of local-dt java.time.ZoneOffset/UTC)))))

(defn format-date-display [date]
  (let [formatter (java.time.format.DateTimeFormatter/ofPattern "yyyy-MM-dd HH:mm")]
    (.format formatter date)))

;; Fetch public user events via REST to capture IssueCommentEvent (issue/PR comments)
(defn fetch-user-comment-events [username start-date end-date]
  (let [per-page 100
        auth-headers (cond-> {"Accept" "application/vnd.github+json"}
                       (:github-token config) (assoc "Authorization" (str "Bearer " (:github-token config))))]
    (loop [page 1
           acc []
           stop? false]
      (if stop?
        acc
        (let [url (str github-rest-base-url "/users/" username "/events?per_page=" per-page "&page=" page)
              resp (curl/get url {:headers auth-headers})
              status (:status resp)
              body (:body resp)
              events (when (= status 200) (json/parse-string body true))]
          (if (or (not= status 200) (empty? events))
            acc
            (let [processed (reduce (fn [out ev]
                                      (let [created-at (parse-date (:created_at ev))
                                            newer-than-window? (.isAfter created-at end-date)
                                            older-than-window? (.isBefore created-at start-date)]
                                        (cond
                                          newer-than-window? out
                                          older-than-window? (reduced {:out out :stop true})
                                          :else
                                          (if (and (= (:type ev) "IssueCommentEvent")
                                                   (:public ev))
                                            (let [repo-name (get-in ev [:repo :name])
                                                  title (get-in ev [:payload :issue :title])
                                                  url (or (get-in ev [:payload :comment :html_url])
                                                          (get-in ev [:payload :issue :html_url]))
                                                  entry {:type "IssueCommentEvent"
                                                         :repo repo-name
                                                         :created_at (format-date-display created-at)
                                                         :details {:title title :url url}}]
                                              (conj out entry))
                                            out))))
                                    []
                                    events)
                  out (if (and (map? processed) (:out processed)) (:out processed) processed)
                  reached-end? (and (map? processed) (:stop processed))]
              (recur (inc page) (into acc out) reached-end?))))))))

;; Count private IssueCommentEvent via REST (public=false) - temporarily disabled, return 0
(defn fetch-private-issue-comment-count [_ _ _]
  0)

;;

(defn fetch-contributions [username start-date end-date]
  (let [start-date-str (format-date start-date)
        end-date-str (format-date end-date)
        query "
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      commitContributionsByRepository {
        repository { name owner { login } isPrivate url }
        contributions(first: 100) { totalCount nodes { occurredAt resourcePath url } }
      }
      pullRequestContributionsByRepository {
        repository { name owner { login } isPrivate url }
        contributions(first: 100) { totalCount nodes { pullRequest { title url createdAt } } }
      }
      pullRequestReviewContributionsByRepository {
        repository { name owner { login } isPrivate url }
        contributions(first: 100) { totalCount nodes { pullRequestReview { url createdAt state pullRequest { title url } } } }
      }
      issueContributionsByRepository {
        repository { name owner { login } isPrivate url }
        contributions(first: 100) { totalCount nodes { issue { title url createdAt } } }
      }
      restrictedContributionsCount
    }
  }
}"
        variables {"username" username
                   "from" start-date-str
                   "to" end-date-str}
        response (curl/post github-graphql-url
                            {:headers headers
                             :body (json/generate-string {"query" query "variables" variables})})
        parsed (when (= 200 (:status response)) (json/parse-string (:body response) true))]
    (when (and parsed (not (get parsed :errors)))
      (get-in parsed [:data :user :contributionsCollection]))))

(defn process-contributions [data start-date end-date]
  (let [contributions (atom [])
        restricted-count (get data :restrictedContributionsCount 0)
        total-private (or restricted-count 0)]
    ;; Process commits
    (doseq [repo-data (get data :commitContributionsByRepository [])]
      (when-not (get-in repo-data [:repository :isPrivate])
        ;; Get basic repository information
        (let [repo-name (str (get-in repo-data [:repository :owner :login]) "/"
                             (get-in repo-data [:repository :name]))
              ;; Get total count of commits directly from API
              total-commits (get-in repo-data [:contributions :totalCount] 0)
              ;; Get all commit nodes to find at least one valid commit for date info
              commit-nodes (get-in repo-data [:contributions :nodes] [])
              ;; Filter nodes to find at least one valid commit within our specific date range
              valid-commit-nodes (filter (fn [commit]
                                           (let [created-at (parse-date (get commit :occurredAt))]
                                             (and (not (.isBefore created-at start-date))
                                                  (not (.isAfter created-at end-date)))))
                                         commit-nodes)]

          ;; IMPORTANT: Only add the contribution if we have at least one valid commit in our date range
          (when (seq valid-commit-nodes)
            ;; Get date from first valid commit for sorting/display
            (let [first-commit (first valid-commit-nodes)
                  commit-date (parse-date (get first-commit :occurredAt))]
              ;; Add a single PushEvent entry for this repository, with proper commit count
              (swap! contributions conj
                     {:type "PushEvent"
                      :repo repo-name
                      :created_at (format-date-display commit-date)
                      :details {:commits total-commits}}))))))

    ;; Process pull requests
    (doseq [repo-data (get data :pullRequestContributionsByRepository [])]
      (when-not (get-in repo-data [:repository :isPrivate])
        (let [repo-name (str (get-in repo-data [:repository :owner :login]) "/"
                             (get-in repo-data [:repository :name]))]
          (doseq [pr (get-in repo-data [:contributions :nodes] [])]
            (let [created-at (parse-date (get-in pr [:pullRequest :createdAt]))]
              (when (and (not (.isBefore created-at start-date))
                         (not (.isAfter created-at end-date)))
                (swap! contributions conj
                       {:type "PullRequestEvent"
                        :repo repo-name
                        :created_at (format-date-display created-at)
                        :details {:action "opened"
                                  :title (get-in pr [:pullRequest :title])
                                  :url (get-in pr [:pullRequest :url])}})))))))

    ;; Process pull request reviews
    (doseq [repo-data (get data :pullRequestReviewContributionsByRepository [])]
      (when-not (get-in repo-data [:repository :isPrivate])
        (let [repo-name (str (get-in repo-data [:repository :owner :login]) "/"
                             (get-in repo-data [:repository :name]))]
          (doseq [prr (get-in repo-data [:contributions :nodes] [])]
            (let [created-at (parse-date (get-in prr [:pullRequestReview :createdAt]))]
              (when (and (not (.isBefore created-at start-date))
                         (not (.isAfter created-at end-date)))
                (swap! contributions conj
                       {:type "PullRequestReviewEvent"
                        :repo repo-name
                        :created_at (format-date-display created-at)
                        :details {:url (get-in prr [:pullRequestReview :url])
                                  :title (get-in prr [:pullRequestReview :pullRequest :title])
                                  :state (get-in prr [:pullRequestReview :state])}})))))))

    ;; Process issue comments
    (doseq [ic (get data :issueCommentContributions [])]
      (let [repo (get ic :repository)
            private? (get repo :isPrivate)
            repo-name (str (get-in repo [:owner :login]) "/" (get repo :name))
            created-at (parse-date (get-in ic [:comment :createdAt]))]
        (when (and (not private?)
                   (not (.isBefore created-at start-date))
                   (not (.isAfter created-at end-date)))
          (swap! contributions conj
                 {:type "IssueCommentEvent"
                  :repo repo-name
                  :created_at (format-date-display created-at)
                  :details {:title (get-in ic [:issue :title])
                            :url (get-in ic [:comment :url])}}))))

    ;; Process issues
    (doseq [repo-data (get data :issueContributionsByRepository [])]
      (when-not (get-in repo-data [:repository :isPrivate])
        (let [repo-name (str (get-in repo-data [:repository :owner :login]) "/"
                             (get-in repo-data [:repository :name]))]
          (doseq [issue (get-in repo-data [:contributions :nodes] [])]
            (let [created-at (parse-date (get-in issue [:issue :createdAt]))]
              (when (and (not (.isBefore created-at start-date))
                         (not (.isAfter created-at end-date)))
                (swap! contributions conj
                       {:type "IssuesEvent"
                        :repo repo-name
                        :created_at (format-date-display created-at)
                        :details {:action "opened"
                                  :title (get-in issue [:issue :title])
                                  :url (get-in issue [:issue :url])}})))))))

    {:public-contributions @contributions
     :restricted-count total-private}))

(defn generate-markdown [year-month contributions restricted-count]
  (let [[year month] (str/split year-month #"-")
        month-name (-> (java.time.YearMonth/of (parse-long year) (parse-long month))
                       (.format (java.time.format.DateTimeFormatter/ofPattern "MMMM")))
        ;; Calculate first and last day of the month
        first-day (str year "-" month "-01")
        last-day (-> (java.time.YearMonth/of (parse-long year) (parse-long month))
                     (.atEndOfMonth)
                     (.format (java.time.format.DateTimeFormatter/ofPattern "yyyy-MM-dd")))
        content (atom (str "---\n"
                           "title: \"Open Source Contributions - " month-name " " year "\"\n"
                           "description: \"Timeline of my contributions to open source projects on GitHub during " month-name " " year ".\"\n"
                           "date: " year "-" month "-01\n"
                           "url: /foss/" year "/" month "\n"
                           "draft: false\n"
                           "---\n\n"
                           "Below is the timeline of my contributions to open source projects during " month-name " " year ".\n\n"))]

    ;; Organize contributions by day
    (let [contributions-by-day (group-by #(first (str/split (:created_at %) #" ")) contributions)
          sorted-days (vec (sort (keys contributions-by-day)))
          ;; Separate push events from others
          push-events (filter #(= "PushEvent" (:type %)) contributions)
          other-events (filter #(not= "PushEvent" (:type %)) contributions)]

      ;; Process daily events (excluding push events)
      (doseq [day (rseq sorted-days)]
        (let [day-events (filter #(= day (first (str/split (:created_at %) #" "))) other-events)]
          (when (seq day-events)
            (swap! content str "## " day "\n\n")
            (doseq [contrib day-events]
              (let [event-type (:type contrib)
                    repo-name (:repo contrib)]
                (case event-type
                  "PullRequestEvent"
                  (let [action (get-in contrib [:details :action])
                        title (get-in contrib [:details :title])
                        url (get-in contrib [:details :url])]
                    (case action
                      "opened" (swap! content str "- 🔀 Opened PR in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ")\n")
                      "closed" (swap! content str "- ✅ Closed PR in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ")\n")
                      (swap! content str "- 🔀 " (str/capitalize action) " PR in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ")\n")))

                  "PullRequestReviewEvent"
                  (let [title (get-in contrib [:details :title])
                        url (get-in contrib [:details :url])
                        state (get-in contrib [:details :state])
                        state-icon (case state
                                     "APPROVED" "✅"
                                     "CHANGES_REQUESTED" "🔍"
                                     "COMMENTED" "💬"
                                     "DISMISSED" "❌"
                                     "📝")]
                    (swap! content str "- " state-icon " Reviewed PR in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ") (" (str/capitalize (str/replace state "_" " ")) ")\n"))

                  "IssuesEvent"
                  (let [action (get-in contrib [:details :action])
                        title (get-in contrib [:details :title])
                        url (get-in contrib [:details :url])]
                    (case action
                      "opened" (swap! content str "- 🐛 Opened issue in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ")\n")
                      "closed" (swap! content str "- ✅ Closed issue in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ")\n")
                      (swap! content str "- 🐛 " (str/capitalize action) " issue in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ")\n")))

                  "IssueCommentEvent"
                  (let [title (get-in contrib [:details :title])
                        url (get-in contrib [:details :url])]
                    (swap! content str "- 💬 Commented on issue in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ")\n"))

                  "CreateEvent"
                  (swap! content str "- 🏗️ Created repository or branch in [" repo-name "](https://github.com/" repo-name ")\n")

                  "ForkEvent"
                  (swap! content str "- 🍴 Forked [" repo-name "](https://github.com/" repo-name ")\n")

                  "WatchEvent"
                  (swap! content str "- ⭐ Starred [" repo-name "](https://github.com/" repo-name ")\n")

                  ;; Default case for any other unhandled event types
                  (swap! content str "- " event-type " in [" repo-name "](https://github.com/" repo-name ")\n"))))
            (swap! content str "\n"))))

      ;; Add push events section at the end
      (when (seq push-events)
        (swap! content str "## Commits\n\n")
        ;; Group push events by repository
        (let [pushes-by-repo (group-by :repo push-events)]
          (doseq [[repo-name push-contribs] pushes-by-repo]
            (let [push-event (first push-contribs)
                  commit-count (get-in push-event [:details :commits] 0)]
              (swap! content str "- 🔨 Push to [" repo-name "](https://github.com/" repo-name "): " commit-count " commit(s)\n")
              (swap! content str "  - [See commits](https://github.com/" repo-name "/commits?author=" (:github-username config)
                     "&since=" first-day "T00:00:00Z&until=" last-day "T23:59:59Z)\n"))))
        (swap! content str "\n")))

    ;; Add private contributions count at the very end (always show)
    (let [private-count (or restricted-count 0)]
      (swap! content str "## Private contributions\n\n")
      (swap! content str "- 🔒 " private-count " private contribution(s) this month\n\n"))

    @content))

(defn process-month [year month]
  (let [target-date (java.time.YearMonth/of year month)
        year-month (str (.getYear target-date) "-" (format "%02d" (.getMonthValue target-date)))
        start-date (-> (java.time.LocalDate/of year month 1)
                       (.atStartOfDay (java.time.ZoneId/of "UTC")))
        end-date (-> (java.time.LocalDate/of year month 1)
                     (.plusMonths 1)
                     (.minusDays 1)
                     (.atTime 23 59 59)
                     (.atZone (java.time.ZoneId/of "UTC")))
        base-dir (io/file (:base-dir config))]

    ;; Ensure base directory exists
    (fs/create-dirs base-dir)

    ;; Get contributions using GraphQL API and merge REST IssueCommentEvent
    (let [contrib-data (fetch-contributions (:github-username config) start-date end-date)
          processed (when contrib-data
                      (process-contributions contrib-data start-date end-date))
          public-contributions (or (:public-contributions processed) [])
          restricted-count (:restricted-count processed)
          private-ic-rest (fetch-private-issue-comment-count (:github-username config) start-date end-date)
          restricted-total (+ (or restricted-count 0) (or private-ic-rest 0))
          comment-events (fetch-user-comment-events (:github-username config) start-date end-date)
          merged (vec (concat public-contributions (or comment-events [])))
          file-name (str year-month ".md")
          file-path (io/file base-dir file-name)
          md-content (generate-markdown year-month merged restricted-total)]

      ;; Save markdown file
      (spit file-path md-content)
      (println (str "Generated markdown file with " (count merged)
                    (when (and restricted-total (> restricted-total 0))
                      (str " public (+" restricted-total " private)"))
                    " contributions for " file-name)))))

(defn parse-date-range [start-date end-date]
  (let [start (java.time.YearMonth/parse start-date)
        end (java.time.YearMonth/parse end-date)]
    (loop [current start
           months []]
      (if (.isAfter current end)
        months
        (recur (.plusMonths current 1)
               (conj months [(.getYear current) (.getMonthValue current)]))))))

(def cli-options
  [["-e" "--date-end DATE" "End date in YYYY-MM format"
    :default (str (java.time.YearMonth/now))
    :validate [#(re-matches #"\d{4}-\d{2}" %) "Must be in YYYY-MM format"]]])

(defn -main [& args]
  (let [{:keys [options arguments errors]} (parse-opts args cli-options)]
    (when errors
      (println "Errors:" errors)
      (System/exit 1))

    (let [start-date (if (= 2 (count arguments))
                       (let [year (parse-long (first arguments))
                             month (parse-long (second arguments))]
                         (str year "-" (format "%02d" month)))
                       (let [current-month (java.time.YearMonth/now)
                             prev-month (.minusMonths current-month 1)]
                         (str (.getYear prev-month) "-" (format "%02d" (.getMonthValue prev-month)))))]

      (doseq [[year month] (parse-date-range start-date (:date-end options))]
        (process-month year month)))))

(when (= *file* (System/getProperty "babashka.file"))
  (apply -main *command-line-args*))