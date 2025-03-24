#!/usr/bin/env python3
import os
import requests
import datetime
from dateutil.relativedelta import relativedelta
from pathlib import Path
import yaml

# Configuration
GITHUB_USERNAME = os.environ.get('GITHUB_USERNAME', 'avelino')
GITHUB_TOKEN = os.environ.get('GH_TOKEN')
BASE_DIR = Path('content/foss')

# Headers for authentication
HEADERS = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json',
}

def get_month_contributions(username, start_date, end_date):
    """Gets GitHub contributions for a specific period."""
    # List to store contributions
    contributions = []

    # Get user events
    page = 1
    while True:
        response = requests.get(
            f'https://api.github.com/users/{username}/events',
            headers=HEADERS,
            params={'page': page, 'per_page': 100}
        )

        if response.status_code != 200:
            print(f"Error retrieving events: {response.status_code}")
            print(response.text)
            break

        events = response.json()
        if not events:
            break

        # Filter events by period
        for event in events:
            created_at = datetime.datetime.strptime(event['created_at'], '%Y-%m-%dT%H:%M:%SZ')
            if start_date <= created_at <= end_date:
                contributions.append({
                    'type': event['type'],
                    'repo': event['repo']['name'],
                    'created_at': created_at.strftime('%Y-%m-%d %H:%M'),
                    'details': get_event_details(event)
                })
            elif created_at < start_date:
                # If we find events older than the period, we can stop
                return contributions

        page += 1

        # GitHub has a limit of 10 pages for events
        if page > 10:
            break

    return contributions

def get_event_details(event):
    """Extracts specific details from the event based on type."""
    details = {}

    if event['type'] == 'PushEvent' and 'payload' in event:
        details['commits'] = len(event['payload'].get('commits', []))
        if 'commits' in event['payload'] and event['payload']['commits']:
            details['message'] = event['payload']['commits'][0].get('message', '')

    elif event['type'] == 'PullRequestEvent' and 'payload' in event:
        details['action'] = event['payload'].get('action', '')
        details['title'] = event['payload'].get('pull_request', {}).get('title', '')
        details['url'] = event['payload'].get('pull_request', {}).get('html_url', '')

    elif event['type'] == 'IssuesEvent' and 'payload' in event:
        details['action'] = event['payload'].get('action', '')
        details['title'] = event['payload'].get('issue', {}).get('title', '')
        details['url'] = event['payload'].get('issue', {}).get('html_url', '')

    elif event['type'] == 'IssueCommentEvent' and 'payload' in event:
        details['action'] = event['payload'].get('action', '')
        details['title'] = event['payload'].get('issue', {}).get('title', '')
        details['url'] = event['payload'].get('comment', {}).get('html_url', '')

    return details

def generate_markdown(year_month, contributions):
    """Generates markdown content for monthly contributions."""
    year, month = year_month.split('-')
    month_name = datetime.datetime(int(year), int(month), 1).strftime('%B')

    content = f"""---
title: "Open Source Contributions - {month_name} {year}"
description: "Timeline of my contributions to open source projects on GitHub during {month_name} {year}."
date: {year}-{month}-01
draft: false
---

# Open Source Contributions - {month_name} {year}

Below is the timeline of my contributions to open source projects during {month_name} {year}.

"""

    # Organize contributions by day
    contributions_by_day = {}
    for contrib in contributions:
        day = contrib['created_at'].split(' ')[0]
        if day not in contributions_by_day:
            contributions_by_day[day] = []
        contributions_by_day[day].append(contrib)

    # Add contributions by day in reverse chronological order
    for day in sorted(contributions_by_day.keys(), reverse=True):
        content += f"## {day}\n\n"

        for contrib in contributions_by_day[day]:
            event_type = contrib['type']
            repo_name = contrib['repo']

            if event_type == 'PushEvent':
                commits = contrib['details'].get('commits', 0)
                message = contrib['details'].get('message', '').split('\n')[0]  # First line of the message
                content += f"- 🔨 Push to [{repo_name}](https://github.com/{repo_name}): {commits} commit(s)\n"
                if message:
                    content += f"  - {message}\n"

            elif event_type == 'PullRequestEvent':
                action = contrib['details'].get('action', '')
                title = contrib['details'].get('title', '')
                url = contrib['details'].get('url', '')

                if action == 'opened':
                    content += f"- 🔀 Opened PR in [{repo_name}](https://github.com/{repo_name}): [{title}]({url})\n"
                elif action == 'closed':
                    content += f"- ✅ Closed PR in [{repo_name}](https://github.com/{repo_name}): [{title}]({url})\n"
                else:
                    content += f"- 🔀 {action.capitalize()} PR in [{repo_name}](https://github.com/{repo_name}): [{title}]({url})\n"

            elif event_type == 'IssuesEvent':
                action = contrib['details'].get('action', '')
                title = contrib['details'].get('title', '')
                url = contrib['details'].get('url', '')

                if action == 'opened':
                    content += f"- 🐛 Opened issue in [{repo_name}](https://github.com/{repo_name}): [{title}]({url})\n"
                elif action == 'closed':
                    content += f"- ✅ Closed issue in [{repo_name}](https://github.com/{repo_name}): [{title}]({url})\n"
                else:
                    content += f"- 🐛 {action.capitalize()} issue in [{repo_name}](https://github.com/{repo_name}): [{title}]({url})\n"

            elif event_type == 'IssueCommentEvent':
                title = contrib['details'].get('title', '')
                url = contrib['details'].get('url', '')
                content += f"- 💬 Commented on issue in [{repo_name}](https://github.com/{repo_name}): [{title}]({url})\n"

            elif event_type == 'CreateEvent':
                content += f"- 🏗️ Created repository or branch in [{repo_name}](https://github.com/{repo_name})\n"

            elif event_type == 'ForkEvent':
                content += f"- 🍴 Forked [{repo_name}](https://github.com/{repo_name})\n"

            elif event_type == 'WatchEvent':
                content += f"- ⭐ Starred [{repo_name}](https://github.com/{repo_name})\n"

            else:
                content += f"- {event_type} in [{repo_name}](https://github.com/{repo_name})\n"

        content += "\n"

    return content

def main():
    # Ensure base directory exists
    BASE_DIR.mkdir(parents=True, exist_ok=True)

    # Determine current month and previous month
    today = datetime.datetime.now()
    current_month = today.replace(day=1)
    prev_month = current_month - relativedelta(months=1)

    # File name in YYYY-MM.md format
    file_name = f"{prev_month.strftime('%Y-%m')}.md"

    # Determine start and end dates
    start_date = prev_month
    end_date = current_month - datetime.timedelta(seconds=1)

    print(f"Getting contributions from {start_date} to {end_date}")

    # Get contributions
    contributions = get_month_contributions(GITHUB_USERNAME, start_date, end_date)

    if contributions:
        # Generate markdown file
        md_content = generate_markdown(prev_month.strftime('%Y-%m'), contributions)

        # Save markdown file directly in the base directory
        with open(BASE_DIR / file_name, 'w', encoding='utf-8') as f:
            f.write(md_content)

        print(f"Generated markdown file with {len(contributions)} contributions for {file_name}")
    else:
        print(f"No contributions found for {prev_month.strftime('%Y-%m')}")

if __name__ == "__main__":
    main()