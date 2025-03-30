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
   :github-token (System/getenv "GH_TOKEN")
   :base-dir "content/foss"})

(println "GitHub Token status:" (if (:github-token config) "Presente" "Ausente"))

(def headers
  {"Authorization" (str "Bearer " (:github-token config))
   "Content-Type" "application/json"})

(def github-graphql-url "https://api.github.com/graphql")

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

(defn fetch-contributions [username start-date end-date]
  (let [start-date-str (format-date start-date)
        end-date-str (format-date end-date)
        query "
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      commitContributionsByRepository {
        repository {
          name
          owner {
            login
          }
          isPrivate
          url
        }
        contributions(first: 100) {
          totalCount
          nodes {
            occurredAt
            resourcePath
            url
          }
        }
      }
      pullRequestContributionsByRepository {
        repository {
          name
          owner {
            login
          }
          isPrivate
          url
        }
        contributions(first: 100) {
          totalCount
          nodes {
            pullRequest {
              title
              url
              createdAt
            }
          }
        }
      }
      issueContributionsByRepository {
        repository {
          name
          owner {
            login
          }
          isPrivate
          url
        }
        contributions(first: 100) {
          totalCount
          nodes {
            issue {
              title
              url
              createdAt
            }
          }
        }
      }
    }
  }
}"
        variables {"username" username
                   "from" start-date-str
                   "to" end-date-str}
        response (curl/post github-graphql-url
                            {:headers headers
                             :body (json/generate-string {"query" query "variables" variables})})]
    (when (= 200 (:status response))
      (let [data (json/parse-string (:body response) true)]
        (when-not (get-in data [:errors])
          (get-in data [:data :user :contributionsCollection]))))))

(defn process-contributions [data start-date end-date]
  (let [contributions (atom [])]
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

    @contributions))

;; The generate-markdown function remains unchanged from original
(defn generate-markdown [year-month contributions]
  (let [[year month] (str/split year-month #"-")
        month-name (-> (java.time.YearMonth/of (parse-long year) (parse-long month))
                       (.format (java.time.format.DateTimeFormatter/ofPattern "MMMM")))
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
          sorted-days (vec (sort (keys contributions-by-day)))]
      (doseq [day (rseq sorted-days)]
        (swap! content str "## " day "\n\n")
        (let [contribs-for-day (contributions-by-day day)
              ;; Separate push events from others
              push-events (filter #(= "PushEvent" (:type %)) contribs-for-day)
              other-events (filter #(not= "PushEvent" (:type %)) contribs-for-day)
              ;; Group push events by repository
              pushes-by-repo (group-by :repo push-events)]

          ;; Process aggregated push events
          (doseq [[repo-name push-contribs] pushes-by-repo]
            (let [;; Get the first push event for this repo (should be only one after our processing)
                  push-event (first push-contribs)
                  ;; Extract commit count from details
                  commit-count (get-in push-event [:details :commits] 0)
                  ;; Parse the date for the link
                  created-at (parse-date (get push-event :created_at))
                  date-str (.format (java.time.format.DateTimeFormatter/ofPattern "yyyy-MM-dd") created-at)]
              ;; Generate the markdown line with proper commit count
              (swap! content str "- 🔨 Push to [" repo-name "](https://github.com/" repo-name "): " commit-count " commit(s)\n")
              ;; Generate link to commits by this user on this date
              (swap! content str "  - [See commits](https://github.com/" repo-name "/commits?author=" (:github-username config)
                     "&since=" date-str "T00:00:00Z&until=" date-str "T23:59:59Z)\n")))

          ;; Process other event types individually
          (doseq [contrib other-events]
            (let [event-type (:type contrib)
                  repo-name (:repo contrib)]
              ;; Use case to handle different event types, excluding PushEvent which is handled above
              (case event-type
                "PullRequestEvent"
                (let [action (get-in contrib [:details :action])
                      title (get-in contrib [:details :title])
                      url (get-in contrib [:details :url])]
                  (case action
                    "opened" (swap! content str "- 🔀 Opened PR in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ")\n")
                    "closed" (swap! content str "- ✅ Closed PR in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ")\n")
                    (swap! content str "- 🔀 " (str/capitalize action) " PR in [" repo-name "](https://github.com/" repo-name "): [" title "](" url ")\n")))

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

                ;; Default case for any other unhandled event types (ensure not PushEvent)
                (when (not= event-type "PushEvent")
                  (swap! content str "- " event-type " in [" repo-name "](https://github.com/" repo-name ")\n"))))))
        (swap! content str "\n"))) ;; Add newline after each day's entries

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

    ;; Get contributions using GraphQL API
    (let [contrib-data (fetch-contributions (:github-username config) start-date end-date)
          contributions (when contrib-data
                          (process-contributions contrib-data start-date end-date))
          file-name (str year-month ".md")
          file-path (io/file base-dir file-name)
          md-content (generate-markdown year-month (or contributions []))]

      ;; Save markdown file
      (spit file-path md-content)
      (println (str "Generated markdown file with " (count (or contributions [])) " contributions for " file-name)))))

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

      (let [months (parse-date-range start-date (:date-end options))]
        (doseq [[year month] months]
          (process-month year month))))))

(when (= *file* (System/getProperty "babashka.file"))
  (apply -main *command-line-args*))