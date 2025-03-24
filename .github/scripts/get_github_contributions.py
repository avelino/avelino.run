#!/usr/bin/env python3
import os
import requests
import datetime
import argparse
from dateutil.relativedelta import relativedelta
from pathlib import Path
import yaml
import json

# Configuration
GITHUB_USERNAME = os.environ.get('GITHUB_USERNAME', 'avelino')
GITHUB_TOKEN = os.environ.get('GH_TOKEN')
BASE_DIR = Path('content/foss')

# Headers for authentication
HEADERS = {
    'Authorization': f'Bearer {GITHUB_TOKEN}',
    'Content-Type': 'application/json',
}

# GraphQL endpoint
GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'

def fetch_contributions(username, start_date, end_date):
    """
    Fetch user contributions using GitHub GraphQL API
    """
    # Format dates as ISO strings
    start_date_str = start_date.strftime('%Y-%m-%dT00:00:00Z')
    end_date_str = end_date.strftime('%Y-%m-%dT23:59:59Z')

    print(f"Fetching contributions from {start_date_str} to {end_date_str}")
    print(f"Using username: {username}")

    # GraphQL query for user contributions
    query = """
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
    }
    """

    variables = {
        "username": username,
        "from": start_date_str,
        "to": end_date_str
    }

    print(f"GraphQL variables: {json.dumps(variables, indent=2)}")

    # Make the GraphQL request
    try:
        response = requests.post(
            GITHUB_GRAPHQL_URL,
            headers=HEADERS,
            json={"query": query, "variables": variables}
        )

        print(f"GraphQL response status: {response.status_code}")

        if response.status_code != 200:
            print(f"Error fetching contributions: {response.status_code}")
            print(response.text)
            return []

        data = response.json()
        if "errors" in data:
            print(f"GraphQL errors: {json.dumps(data['errors'], indent=2)}")
            return []

        # Log a preview of the response for debugging
        print("Response preview:")
        print(json.dumps(data, indent=2)[:500] + "...")

        return process_graphql_data(data, start_date, end_date)
    except Exception as e:
        print(f"Exception in GraphQL request: {str(e)}")
        return []

def process_graphql_data(data, start_date, end_date):
    """Process GraphQL response data into a list of contributions"""
    contributions = []

    if not data.get('data') or not data['data'].get('user'):
        print("No user data found in response")
        return contributions

    contrib_data = data['data']['user']['contributionsCollection']

    # Process commits
    commit_repos = contrib_data.get('commitContributionsByRepository', [])
    print(f"Found commit contributions for {len(commit_repos)} repositories")

    for repo_data in commit_repos:
        if repo_data['repository']['isPrivate']:
            continue

        repo_name = f"{repo_data['repository']['owner']['login']}/{repo_data['repository']['name']}"
        commit_nodes = repo_data['contributions'].get('nodes', [])
        total_count = repo_data['contributions'].get('totalCount', 0)

        print(f"Repository {repo_name}: {total_count} total commits, {len(commit_nodes)} fetched")

        for commit_contrib in commit_nodes:
            created_at = datetime.datetime.strptime(commit_contrib['occurredAt'], '%Y-%m-%dT%H:%M:%SZ')
            if start_date <= created_at <= end_date:
                contributions.append({
                    'type': 'PushEvent',
                    'repo': repo_name,
                    'created_at': created_at.strftime('%Y-%m-%d %H:%M'),
                    'details': {
                        'commits': 1,
                        'url': commit_contrib['url']
                    }
                })

    # Process pull requests
    pr_repos = contrib_data.get('pullRequestContributionsByRepository', [])
    print(f"Found PR contributions for {len(pr_repos)} repositories")

    for repo_data in pr_repos:
        if repo_data['repository']['isPrivate']:
            continue

        repo_name = f"{repo_data['repository']['owner']['login']}/{repo_data['repository']['name']}"
        pr_count = repo_data['contributions'].get('totalCount', 0)
        pr_nodes = repo_data['contributions'].get('nodes', [])

        print(f"Repository {repo_name}: {pr_count} total PRs, {len(pr_nodes)} fetched")

        for pr in repo_data['contributions'].get('nodes', []):
            created_at = datetime.datetime.strptime(pr['pullRequest']['createdAt'], '%Y-%m-%dT%H:%M:%SZ')
            if start_date <= created_at <= end_date:
                contributions.append({
                    'type': 'PullRequestEvent',
                    'repo': repo_name,
                    'created_at': created_at.strftime('%Y-%m-%d %H:%M'),
                    'details': {
                        'action': 'opened',
                        'title': pr['pullRequest']['title'],
                        'url': pr['pullRequest']['url']
                    }
                })

    # Process issues
    issue_repos = contrib_data.get('issueContributionsByRepository', [])
    print(f"Found issue contributions for {len(issue_repos)} repositories")

    for repo_data in issue_repos:
        if repo_data['repository']['isPrivate']:
            continue

        repo_name = f"{repo_data['repository']['owner']['login']}/{repo_data['repository']['name']}"
        issue_count = repo_data['contributions'].get('totalCount', 0)
        issue_nodes = repo_data['contributions'].get('nodes', [])

        print(f"Repository {repo_name}: {issue_count} total issues, {len(issue_nodes)} fetched")

        for issue in repo_data['contributions'].get('nodes', []):
            created_at = datetime.datetime.strptime(issue['issue']['createdAt'], '%Y-%m-%dT%H:%M:%SZ')
            if start_date <= created_at <= end_date:
                contributions.append({
                    'type': 'IssuesEvent',
                    'repo': repo_name,
                    'created_at': created_at.strftime('%Y-%m-%d %H:%M'),
                    'details': {
                        'action': 'opened',
                        'title': issue['issue']['title'],
                        'url': issue['issue']['url']
                    }
                })

    print(f"Found {len(contributions)} contributions in public repositories")
    return contributions

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
                url = contrib['details'].get('url', '')
                content += f"- 🔨 Push to [{repo_name}](https://github.com/{repo_name}): {commits} commit(s)\n"
                if url:
                    content += f"  - [Ver commit]({url})\n"

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
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Generate GitHub contributions report for a month')
    parser.add_argument('--year', type=int, help='Year to generate report for (defaults to current year for previous month)')
    parser.add_argument('--month', type=int, help='Month to generate report for (defaults to previous month)')
    args = parser.parse_args()

    # Ensure base directory exists
    BASE_DIR.mkdir(parents=True, exist_ok=True)

    # Determine current month and previous month
    today = datetime.datetime.now()
    print(f"Current date detected: {today}")

    # Use command line arguments if provided, otherwise calculate based on current date
    if args.year and args.month:
        # Use specified year and month
        target_year = args.year
        target_month = args.month

        # Verificar se a data especificada é no futuro
        current_year_month = today.year * 100 + today.month
        target_year_month = target_year * 100 + target_month

        if target_year_month > current_year_month:
            print(f"Warning: Target date {target_year}-{target_month:02d} is in the future.")
            print(f"Current date is {today.year}-{today.month:02d}.")
            print("Using the previous month instead.")

            # Recalcular para o mês anterior ao atual
            if today.month == 1:
                target_year = today.year - 1
                target_month = 12
            else:
                target_year = today.year
                target_month = today.month - 1

        # Create date objects
        if target_month == 12:
            next_month_year = target_year + 1
            next_month = 1
        else:
            next_month_year = target_year
            next_month = target_month + 1

        prev_month_first_day = datetime.datetime(target_year, target_month, 1)
        next_month_first_day = datetime.datetime(next_month_year, next_month, 1)
        prev_month_last_day = next_month_first_day - relativedelta(days=1)
    else:
        # Calculate based on current date
        current_month_first_day = datetime.datetime(today.year, today.month, 1)
        prev_month_first_day = current_month_first_day - relativedelta(months=1)
        prev_month_last_day = current_month_first_day - relativedelta(days=1)

    print(f"Using year: {prev_month_first_day.year}, month: {prev_month_first_day.month}")
    print(f"Date range: {prev_month_first_day.strftime('%Y-%m-%d')} to {prev_month_last_day.strftime('%Y-%m-%d %H:%M:%S')}")

    # File name in YYYY-MM.md format
    file_name = f"{prev_month_first_day.strftime('%Y-%m')}.md"

    # Determine start and end dates
    start_date = prev_month_first_day
    end_date = prev_month_last_day

    # Get contributions using GraphQL API
    contributions = fetch_contributions(GITHUB_USERNAME, start_date, end_date)

    if contributions:
        # Generate markdown file
        md_content = generate_markdown(prev_month_first_day.strftime('%Y-%m'), contributions)

        # Save markdown file directly in the base directory
        with open(BASE_DIR / file_name, 'w', encoding='utf-8') as f:
            f.write(md_content)

        print(f"Generated markdown file with {len(contributions)} contributions for {file_name}")
    else:
        print(f"No contributions found for {prev_month_first_day.strftime('%Y-%m')}")

        # Criar um arquivo mesmo sem contribuições
        md_content = generate_markdown(prev_month_first_day.strftime('%Y-%m'), [])
        with open(BASE_DIR / file_name, 'w', encoding='utf-8') as f:
            f.write(md_content)
        print(f"Generated empty markdown file for {file_name}")

if __name__ == "__main__":
    main()