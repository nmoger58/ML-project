import requests
import json
import time
import random
from typing import List, Dict, Optional

class LeetCodeUserCollector:
    def __init__(self):
        self.base_url = "https://leetcode.com/graphql"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com/'
        })
    
    def get_user_profile(self, username: str) -> Optional[Dict]:
        """Get detailed profile information for a specific user"""
        query = """
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    realName
                    aboutMe
                    country
                    company
                    school
                    websites
                    ranking
                }
                submitStats: submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
                badges {
                    id
                    displayName
                    icon
                    creationDate
                }
            }
        }
        """
        
        variables = {"username": username}
        payload = {
            "query": query,
            "variables": variables
        }
        
        try:
            response = self.session.post(self.base_url, json=payload)
            if response.status_code == 200:
                data = response.json()
                if data.get('data', {}).get('matchedUser'):
                    return data['data']['matchedUser']
            return None
        except Exception as e:
            print(f"Error fetching user {username}: {e}")
            return None
    
    def get_contest_ranking(self, contest_slug: str, page: int = 1) -> List[Dict]:
        """Get users from contest rankings"""
        query = """
        query contestRanking($contestSlug: String!, $page: Int!) {
            contestRanking(contestSlug: $contestSlug, page: $page) {
                userContestRanking {
                    user {
                        username
                        profile {
                            realName
                            country
                        }
                    }
                    rank
                    score
                    finishTimeInSeconds
                }
            }
        }
        """
        
        variables = {
            "contestSlug": contest_slug,
            "page": page
        }
        payload = {
            "query": query,
            "variables": variables
        }
        
        try:
            response = self.session.post(self.base_url, json=payload)
            if response.status_code == 200:
                data = response.json()
                rankings = data.get('data', {}).get('contestRanking', {}).get('userContestRanking', [])
                return [ranking['user'] for ranking in rankings if ranking.get('user')]
            return []
        except Exception as e:
            print(f"Error fetching contest rankings: {e}")
            return []
    
    def get_global_ranking(self, page: int = 1) -> List[Dict]:
        """Get users from global ranking"""
        query = """
        query globalRanking($page: Int!) {
            globalRanking(page: $page) {
                rankingNodes {
                    user {
                        username
                        profile {
                            realName
                            country
                            ranking
                        }
                    }
                    problemsSolved
                    ranking
                }
            }
        }
        """
        
        variables = {"page": page}
        payload = {
            "query": query,
            "variables": variables
        }
        
        try:
            response = self.session.post(self.base_url, json=payload)
            if response.status_code == 200:
                data = response.json()
                rankings = data.get('data', {}).get('globalRanking', {}).get('rankingNodes', [])
                return [ranking['user'] for ranking in rankings if ranking.get('user')]
            return []
        except Exception as e:
            print(f"Error fetching global rankings: {e}")
            return []

    def collect_users(self, target_count: int = 100, method: str = "global_ranking") -> List[Dict]:
        """
        Collect users using specified method
        Methods: 'global_ranking', 'contest_ranking'
        """
        users = []
        page = 1
        
        print(f"Collecting {target_count} users using {method} method...")
        
        while len(users) < target_count:
            print(f"Fetching page {page}... (Current count: {len(users)})")
            
            if method == "global_ranking":
                page_users = self.get_global_ranking(page)
            elif method == "contest_ranking":
                # You'll need to replace with actual contest slug
                contest_slug = "weekly-contest-300"  # Example contest
                page_users = self.get_contest_ranking(contest_slug, page)
            else:
                print(f"Unknown method: {method}")
                break
            
            if not page_users:
                print("No more users found or API limit reached")
                break
            
            for user in page_users:
                if len(users) >= target_count:
                    break
                if user['username'] not in [u['username'] for u in users]:
                    users.append(user)
            
            page += 1
            # Add delay to respect rate limits
            time.sleep(random.uniform(1, 3))
        
        print(f"Collected {len(users)} users")
        return users[:target_count]
    
    def get_detailed_user_info(self, usernames: List[str]) -> List[Dict]:
        """Get detailed information for a list of usernames"""
        detailed_users = []
        
        for i, username in enumerate(usernames):
            print(f"Fetching detailed info for {username} ({i+1}/{len(usernames)})")
            
            user_data = self.get_user_profile(username)
            if user_data:
                detailed_users.append(user_data)
            
            # Rate limiting
            time.sleep(random.uniform(0.5, 2))
        
        return detailed_users
    
    def save_to_json(self, users: List[Dict], filename: str = "leetcode_users.json"):
        """Save users data to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
        print(f"Data saved to {filename}")

# Example usage
if __name__ == "__main__":
    collector = LeetCodeUserCollector()
    
    # Method 1: Get users from global ranking
    users = collector.collect_users(target_count=100, method="global_ranking")
    
    # Method 2: Get detailed info for collected users
    usernames = [user['username'] for user in users if user.get('username')]
    detailed_users = collector.get_detailed_user_info(usernames[:50])  # Limit to 50 for API respect
    
    # Save the data
    collector.save_to_json(users, "leetcode_users_basic.json")
    collector.save_to_json(detailed_users, "leetcode_users_detailed.json")
    
    # Print some statistics
    print(f"\nCollected {len(users)} users")
    countries = [user.get('profile', {}).get('country', 'Unknown') for user in users if user.get('profile')]
    print(f"Top countries: {dict(sorted([(c, countries.count(c)) for c in set(countries)], key=lambda x: x[1], reverse=True)[:5])}")