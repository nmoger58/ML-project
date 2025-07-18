# LeetCode ML Analysis System - Standalone Version
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
from sklearn.cluster import KMeans
from typing import List, Dict, Optional
import re
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
import pickle
import os


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class LeetCodeUserData:
    username: str
    rank: str
    totalQuestions: str
    languages: List[str]
    skills: List[str]
    submissions: str
    streak: str

@dataclass
class AnalysisResult:
    username: str
    performance_score: float
    topic_proficiency: Dict[str, float]
    weak_areas: List[str]
    recommendations: List[str]
    suggested_problems: List[Dict[str, str]]
    improvement_roadmap: List[str]

@dataclass
class ProcessedUserData:
    username: str
    rank_numeric: int
    total_solved: int
    total_questions: int
    solve_ratio: float
    languages_count: int
    topic_scores: Dict[str, int]
    submissions_count: int
    active_days: int
    topic_diversity: float
    advanced_topics_ratio: float

class LeetCodeAnalyzer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.performance_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.proficiency_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.kmeans_model = KMeans(n_clusters=5, random_state=42)
        self.topic_encoder = LabelEncoder()
        
        
        self.topic_difficulty = {
            'Array': 1, 'String': 1, 'Hash Table': 2, 'Math': 1,
            'Two Pointers': 2, 'Binary Search': 3, 'Sorting': 2,
            'Greedy': 3, 'Dynamic Programming': 5, 'Backtracking': 4,
            'Stack': 2, 'Queue': 2, 'Linked List': 2, 'Tree': 3,
            'Depth-First Search': 3, 'Breadth-First Search': 3,
            'Binary Tree': 3, 'Heap': 4, 'Graph': 4, 'Trie': 4,
            'Divide and Conquer': 4, 'Union Find': 4, 'Sliding Window': 3,
            'Bit Manipulation': 3, 'Design': 4, 'Geometry': 4,
            'Interactive': 4, 'Segment Tree': 5, 'Binary Indexed Tree': 5
        }
        
        
        self.problem_database = self._initialize_problem_database()
        
    def _initialize_problem_database(self):
        """Initialize problem database with recommendations"""
        return {
            'Array': [
                {'title': 'Two Sum', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/two-sum/'},
                {'title': 'Best Time to Buy and Sell Stock', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/'},
                {'title': 'Maximum Subarray', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/maximum-subarray/'},
                {'title': 'Contains Duplicate', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/contains-duplicate/'}
            ],
            'Dynamic Programming': [
                {'title': 'Climbing Stairs', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/climbing-stairs/'},
                {'title': 'House Robber', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/house-robber/'},
                {'title': 'Longest Increasing Subsequence', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/longest-increasing-subsequence/'},
                {'title': 'Coin Change', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/coin-change/'}
            ],
            'Binary Search': [
                {'title': 'Binary Search', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/binary-search/'},
                {'title': 'Search in Rotated Sorted Array', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/search-in-rotated-sorted-array/'},
                {'title': 'Find Peak Element', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/find-peak-element/'}
            ],
            'String': [
                {'title': 'Valid Anagram', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/valid-anagram/'},
                {'title': 'Longest Substring Without Repeating Characters', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'},
                {'title': 'Valid Palindrome', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/valid-palindrome/'}
            ],
            'Tree': [
                {'title': 'Maximum Depth of Binary Tree', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/maximum-depth-of-binary-tree/'},
                {'title': 'Validate Binary Search Tree', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/validate-binary-search-tree/'},
                {'title': 'Binary Tree Inorder Traversal', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/binary-tree-inorder-traversal/'}
            ],
            'Hash Table': [
                {'title': 'Valid Anagram', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/valid-anagram/'},
                {'title': 'Group Anagrams', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/group-anagrams/'},
                {'title': 'Top K Frequent Elements', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/top-k-frequent-elements/'}
            ],
            'Math': [
                {'title': 'Palindrome Number', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/palindrome-number/'},
                {'title': 'Reverse Integer', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/reverse-integer/'},
                {'title': 'Power of Two', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/power-of-two/'}
            ],
            'Graph': [
                {'title': 'Number of Islands', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/number-of-islands/'},
                {'title': 'Clone Graph', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/clone-graph/'},
                {'title': 'Course Schedule', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/course-schedule/'}
            ]
        }

    def parse_user_data(self, data: LeetCodeUserData) -> ProcessedUserData:
        """Parse and process raw user data"""
        try:
           
            rank_numeric = int(data.rank.replace(',', '')) if data.rank and data.rank != 'N/A' else 1000000
            
          
            solved, total = map(int, data.totalQuestions.split('/'))
            solve_ratio = solved / total if total > 0 else 0
            
          
            topic_scores = {}
            for skill in data.skills:
                
                match = re.match(r'(.+?)x(\d+)', skill)
                if match:
                    topic, count = match.groups()
                    topic_scores[topic.strip()] = int(count)
            
           
            topic_diversity = len(topic_scores) / 20 if topic_scores else 0
            
     
            advanced_topics = sum(1 for topic in topic_scores.keys() 
                                if self.topic_difficulty.get(topic, 3) >= 4)
            advanced_topics_ratio = advanced_topics / len(topic_scores) if topic_scores else 0
            
           
            submissions_count = int(data.submissions) if data.submissions.isdigit() else 0
            
           
            active_days = 0
            if 'active days:' in data.streak:
                active_days = int(re.search(r'active days:(\d+)', data.streak).group(1))
            
            return ProcessedUserData(
                username=data.username,
                rank_numeric=rank_numeric,
                total_solved=solved,
                total_questions=total,
                solve_ratio=solve_ratio,
                languages_count=len(data.languages),
                topic_scores=topic_scores,
                submissions_count=submissions_count,
                active_days=active_days,
                topic_diversity=topic_diversity,
                advanced_topics_ratio=advanced_topics_ratio
            )
        except Exception as e:
            logger.error(f"Error parsing user data: {e}")
            raise ValueError(f"Invalid user data format: {e}")

    def calculate_performance_score(self, processed_data: ProcessedUserData) -> float:
        """Calculate overall performance score (0-100)"""
        
        solve_ratio_score = min(processed_data.solve_ratio * 100 * 0.5, 50)  # Max 50 points
        activity_score = min(processed_data.active_days * 0.5, 20)  # Max 20 points
        diversity_score = processed_data.topic_diversity * 15  # Max 15 points
        advanced_score = processed_data.advanced_topics_ratio * 15  # Max 15 points
        
        total_score = solve_ratio_score + activity_score + diversity_score + advanced_score
        return min(total_score, 100.0)

    def calculate_topic_proficiency(self, processed_data: ProcessedUserData) -> Dict[str, float]:
        """Calculate topic-wise proficiency probabilities"""
        proficiency = {}
        
        for topic, count in processed_data.topic_scores.items():
       
            base_proficiency = min(count / 30, 1.0)
            
           
            difficulty_factor = self.topic_difficulty.get(topic, 3)
            difficulty_adjustment = 1.0 - (difficulty_factor - 1) * 0.05
            
            
            final_proficiency = base_proficiency * difficulty_adjustment
            proficiency[topic] = min(max(final_proficiency, 0.0), 1.0)
        
        return proficiency

    def identify_weak_areas(self, topic_proficiency: Dict[str, float]) -> List[str]:
        """Identify weak areas based on proficiency scores"""
        weak_threshold = 0.4
        weak_areas = [topic for topic, score in topic_proficiency.items() if score < weak_threshold]
        
        
        weak_areas.sort(key=lambda x: topic_proficiency[x])
        
        return weak_areas[:5]

    def generate_recommendations(self, processed_data: ProcessedUserData, weak_areas: List[str]) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        
        if processed_data.active_days < 7:
            recommendations.append("🏃 Establish a consistent daily practice routine - aim for at least 1 problem per day")
        elif processed_data.active_days < 30:
            recommendations.append("📅 Great start! Maintain your practice streak and aim for 30+ active days")
        else:
            recommendations.append("🔥 Excellent consistency! Keep up your daily practice momentum")
        
        
        if processed_data.topic_diversity < 0.3:
            recommendations.append("🌟 Explore more diverse problem types to build well-rounded programming skills")
        elif processed_data.topic_diversity > 0.6:
            recommendations.append("🎯 Great topic diversity! Consider deepening expertise in your strongest areas")
        
       
        if processed_data.advanced_topics_ratio < 0.2:
            recommendations.append("🚀 Challenge yourself with advanced topics like Dynamic Programming and Graph algorithms")
        elif processed_data.advanced_topics_ratio > 0.4:
            recommendations.append("🏆 Impressive work on advanced topics! You're ready for competitive programming")
        
      
        for area in weak_areas[:3]:
            if area in self.topic_difficulty:
                difficulty = self.topic_difficulty[area]
                if difficulty <= 2:
                    recommendations.append(f"📚 Focus on {area} fundamentals - start with Easy problems to build confidence")
                else:
                    recommendations.append(f"💪 Strengthen {area} skills - practice with pattern recognition and common techniques")
        
       
        if processed_data.solve_ratio < 0.02:
            recommendations.append("🌱 Start with Easy problems to build confidence and learn fundamental patterns")
        elif processed_data.solve_ratio < 0.05:
            recommendations.append("📈 Good progress! Mix Easy and Medium problems to expand your skill set")
        elif processed_data.solve_ratio > 0.1:
            recommendations.append("🎉 Excellent solve rate! Consider tackling Hard problems and contest participation")
        
     
        if processed_data.languages_count == 1:
            recommendations.append("🔧 Consider learning a second programming language to expand your toolkit")
        elif processed_data.languages_count > 3:
            recommendations.append("🌐 Great language diversity! Focus on mastering your strongest languages")
        
        return recommendations

    def suggest_problems(self, weak_areas: List[str]) -> List[Dict[str, str]]:
        """Suggest specific problems based on weak areas"""
        suggested = []
        
        for area in weak_areas[:3]: 
            if area in self.problem_database:
                problems = self.problem_database[area][:3] 
                suggested.extend(problems)
        
        if len(suggested) < 5:
            general_problems = [
                {'title': 'Two Sum', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/two-sum/'},
                {'title': 'Valid Parentheses', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/valid-parentheses/'},
                {'title': 'Merge Two Sorted Lists', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/merge-two-sorted-lists/'}
            ]
            suggested.extend(general_problems)
        
        return suggested[:8]

    def create_improvement_roadmap(self, processed_data: ProcessedUserData, weak_areas: List[str]) -> List[str]:
        """Create a structured improvement roadmap"""
        roadmap = []
        
        if processed_data.solve_ratio < 0.02:
            level = "Beginner"
        elif processed_data.solve_ratio < 0.08:
            level = "Intermediate"
        else:
            level = "Advanced"
        
        if level == "Beginner":
            roadmap.append("🎯 Phase 1 (Weeks 1-2): Master basic Array and String problems")
            roadmap.append("   Target: Solve 20+ Easy problems, focus on understanding fundamental concepts")
            roadmap.append("   Practice: Two Sum, Valid Parentheses, Merge Sorted Arrays")
        elif level == "Intermediate":
            roadmap.append("🎯 Phase 1 (Weeks 1-2): Strengthen core algorithmic thinking")
            roadmap.append("   Target: Mix of 15 Easy + 10 Medium problems")
        else:
            roadmap.append("🎯 Phase 1 (Weeks 1-2): Advanced problem-solving patterns")
            roadmap.append("   Target: Focus on Hard problems and optimization techniques")
        
        if weak_areas:
            main_weak_area = weak_areas[0]
            roadmap.append(f"🔍 Phase 2 (Weeks 3-4): Deep dive into {main_weak_area}")
            if level == "Beginner":
                roadmap.append(f"   Target: Complete 15+ {main_weak_area} problems, start with Easy")
            else:
                roadmap.append(f"   Target: Master {main_weak_area} patterns with Medium/Hard problems")
        
        if processed_data.advanced_topics_ratio < 0.3:
            roadmap.append("🚀 Phase 3 (Weeks 5-6): Introduction to Dynamic Programming and Graphs")
            roadmap.append("   Target: Learn classic DP patterns and graph traversal algorithms")
        else:
            roadmap.append("🏆 Phase 3 (Weeks 5-6): Advanced algorithmic techniques")
            roadmap.append("   Target: Segment trees, advanced DP, and competitive programming patterns")
        
        roadmap.append("🎪 Phase 4 (Weeks 7-8): Mixed problem solving and contest participation")
        roadmap.append("   Target: Weekly contests, solve problems combining multiple concepts")
        roadmap.append("   Goal: Improve speed and accuracy under time pressure")
        
        roadmap.append("🌟 Long-term (2+ months): Specialize in preferred domains")
        roadmap.append("   Consider: System design, competitive programming, or interview preparation")
        
        return roadmap

    def analyze_user(self, data: LeetCodeUserData) -> AnalysisResult:
        """Main analysis function"""
        try:
            processed_data = self.parse_user_data(data)
            
            performance_score = self.calculate_performance_score(processed_data)
            topic_proficiency = self.calculate_topic_proficiency(processed_data)
            weak_areas = self.identify_weak_areas(topic_proficiency)
            
            recommendations = self.generate_recommendations(processed_data, weak_areas)
            suggested_problems = self.suggest_problems(weak_areas)
            improvement_roadmap = self.create_improvement_roadmap(processed_data, weak_areas)
            
            return AnalysisResult(
                username=data.username,
                performance_score=performance_score,
                topic_proficiency=topic_proficiency,
                weak_areas=weak_areas,
                recommendations=recommendations,
                suggested_problems=suggested_problems,
                improvement_roadmap=improvement_roadmap
            )
        
        except Exception as e:
            logger.error(f"Error analyzing user {data.username}: {e}")
            raise Exception(f"Analysis failed: {e}")

def print_analysis_results(result: AnalysisResult):
    """Print detailed analysis results to terminal"""
    print("\n" + "="*80)
    print(f"🎯 LEETCODE ANALYSIS REPORT FOR: {result.username.upper()}")
    print("="*80)
    
    print(f"\n📊 OVERALL PERFORMANCE SCORE: {result.performance_score:.1f}/100")
    if result.performance_score >= 80:
        print("   🏆 Excellent! You're performing at an advanced level!")
    elif result.performance_score >= 60:
        print("   🎯 Good progress! You're at an intermediate level!")
    elif result.performance_score >= 40:
        print("   📈 Steady improvement! Keep building your foundation!")
    else:
        print("   🌱 Great start! Focus on fundamentals to build momentum!")
    
    print(f"\n🔍 TOPIC PROFICIENCY ANALYSIS:")
    print("-" * 50)
    if result.topic_proficiency:
        for topic, score in sorted(result.topic_proficiency.items(), key=lambda x: x[1], reverse=True):
            bar_length = int(score * 20)
            bar = "█" * bar_length + "░" * (20 - bar_length)
            percentage = score * 100
            print(f"   {topic:<25} {bar} {percentage:5.1f}%")
    else:
        print("   No topic data available")
    
    print(f"\n⚠️  AREAS NEEDING IMPROVEMENT:")
    print("-" * 50)
    if result.weak_areas:
        for i, area in enumerate(result.weak_areas, 1):
            proficiency = result.topic_proficiency.get(area, 0) * 100
            print(f"   {i}. {area:<25} (Proficiency: {proficiency:.1f}%)")
    else:
        print("   🎉 Great job! No major weak areas identified!")
    
    print(f"\n💡 PERSONALIZED RECOMMENDATIONS:")
    print("-" * 50)
    for i, rec in enumerate(result.recommendations, 1):
        print(f"   {i}. {rec}")
    
    print(f"\n📚 SUGGESTED PROBLEMS TO SOLVE:")
    print("-" * 50)
    if result.suggested_problems:
        for i, problem in enumerate(result.suggested_problems, 1):
            print(f"   {i}. {problem['title']} ({problem['difficulty']})")
            print(f"      🔗 {problem['url']}")
    else:
        print("   No specific problems suggested at this time.")
    
    print(f"\n🗺️  IMPROVEMENT ROADMAP:")
    print("-" * 50)
    for step in result.improvement_roadmap:
        print(f"   {step}")
    
    print("\n" + "="*80)
    print("🚀 Keep coding and improving! Consistency is key to success!")
    print("="*80 + "\n")

def get_user_input():
    """Get user input interactively"""
    print("\n🔧 LeetCode ML Analysis System")
    print("Enter your LeetCode data (or press Enter for sample data):")
    print("-" * 50)
    
    username = input("Username: ").strip()
    if not username:
        print("Using sample data...")
        return None
    
    rank = input("Rank (e.g., 778,890): ").strip()
    total_questions = input("Problems solved/total (e.g., 161/3594): ").strip()
    
    print("Languages (comma-separated, e.g., C++,JavaScript,MySQL):")
    languages_input = input().strip()
    languages = [lang.strip() for lang in languages_input.split(',')] if languages_input else []
    
    print("Skills with counts (comma-separated, e.g., Arrayx83,Stringx46):")
    skills_input = input().strip()
    skills = [skill.strip() for skill in skills_input.split(',')] if skills_input else []
    
    submissions = input("Total submissions (e.g., 170): ").strip()
    streak = input("Active days (e.g., Total active days:17): ").strip()
    
    return LeetCodeUserData(
        username=username,
        rank=rank,
        totalQuestions=total_questions,
        languages=languages,
        skills=skills,
        submissions=submissions,
        streak=streak
    )

import requests
import json
import re
from typing import Optional

def clean_api_data(raw_data: str) -> str:
    """
    Clean data from API by removing newlines and extra text
    """
    if not raw_data:
        return ""
    
    cleaned = raw_data.replace('\n', ' ').strip()
    
    if 'Solved' in cleaned:
        cleaned = cleaned.replace('Solved', '').strip()
    if 'Views' in cleaned:
        cleaned = cleaned.replace('Views', '').strip()
    if 'Total active days:' in cleaned:
        cleaned = cleaned.replace('Total active days:', '').strip()
    
    return cleaned

def parse_total_questions(total_questions_str: str) -> str:
    """
    Parse totalQuestions field from API format
    """
    cleaned = clean_api_data(total_questions_str)
    if '/' in cleaned:
        match = re.search(r'(\d+/\d+)', cleaned)
        if match:
            return match.group(1)
    return cleaned

def parse_submissions(submissions_str: str) -> str:
    """
    Parse submissions field to extract just the number
    """
    cleaned = clean_api_data(submissions_str)
    match = re.search(r'\d+', cleaned)
    if match:
        return match.group(0)
    return cleaned

def parse_streak(streak_str: str) -> str:
    """
    Parse streak field to extract just the number
    """
    cleaned = clean_api_data(streak_str)
    match = re.search(r'\d+', cleaned)
    if match:
        return f"Total active days:{match.group(0)}"
    return cleaned

def fetch_user_from_api(username: str) -> Optional[LeetCodeUserData]:
    """
    Fetch user data from the backend API with proper data cleaning
    """
    try:
        url = f"http://localhost:3003/leetcode/{username}"
        print(f"🌐 Fetching data from API: {url}")
        
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        api_data = response.json()
        
        if not api_data.get("status"):
            print(f"❌ API returned error: {api_data.get('message', 'Unknown error')}")
            return None
        
        user_data = api_data["data"]["data"]
        
        cleaned_rank = clean_api_data(user_data.get("rank", ""))
        cleaned_total_questions = parse_total_questions(user_data.get("totalQuestions", ""))
        cleaned_submissions = parse_submissions(user_data.get("submissions", ""))
        cleaned_streak = parse_streak(user_data.get("streak", ""))
        
        print(f"🔍 Debug - Raw totalQuestions: '{user_data.get('totalQuestions', '')}'")
        print(f"🔍 Debug - Cleaned totalQuestions: '{cleaned_total_questions}'")
        print(f"🔍 Debug - Raw streak: '{user_data.get('streak', '')}'")
        print(f"🔍 Debug - Cleaned streak: '{cleaned_streak}'")
        
        leetcode_user = LeetCodeUserData(
            username=user_data.get("username", ""),
            rank=cleaned_rank,
            totalQuestions=cleaned_total_questions,
            languages=user_data.get("languages", []),
            skills=user_data.get("skills", []),
            submissions=cleaned_submissions,
            streak=cleaned_streak
        )
        
        print(f"✅ Successfully fetched and cleaned data for user: {user_data.get('username', 'Unknown')}")
        return leetcode_user
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        return None
    except KeyError as e:
        print(f"❌ Missing expected field in API response: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def get_username_input() -> str:
    """
    Get username input from user for API fetch
    """
    while True:
        username = input("Enter LeetCode username: ").strip()
        if username:
            return username
        print("❌ Username cannot be empty. Please try again.")

if __name__ == "__main__":
    print("🔧 Initializing LeetCode ML Analysis System...")
    
    analyzer = LeetCodeAnalyzer()
    print("✅ System initialized successfully!")
    
    sample_users = [
        LeetCodeUserData(
            username="lucifer58",
            rank="778,890",
            totalQuestions="161/3594",
            languages=["C++", "JavaScript", "MySQL"],
            skills=[
                "Dynamic Programmingx8",
                "Divide and Conquerx7", 
                "Backtrackingx4",
                "Mathx33",
                "Hash Tablex29",
                "Binary Searchx22",
                "Arrayx83",
                "Stringx46",
                "Sortingx27"
            ],
            submissions="170",
            streak="Total active days:17"
        ),
        LeetCodeUserData(
            username="beginner_coder",
            rank="1,200,000",
            totalQuestions="25/3594",
            languages=["Python"],
            skills=["Arrayx15", "Stringx10", "Mathx5"],
            submissions="30",
            streak="Total active days:5"
        ),
        LeetCodeUserData(
            username="advanced_user",
            rank="50,000",
            totalQuestions="800/3594",
            languages=["C++", "Python", "Java", "Go"],
            skills=[
                "Dynamic Programmingx50",
                "Graphx35",
                "Treex40",
                "Arrayx120",
                "Stringx80",
                "Hash Tablex60",
                "Backtrackingx25",
                "Greedyx30",
                "Binary Searchx45",
                "Sortingx55"
            ],
            submissions="1200",
            streak="Total active days:180"
        )
    ]
    
    # Enhanced options menu
    print("\n🎯 Choose an option:")
    print("1. Use sample data (recommended for testing)")
    print("2. Enter your own data manually")
    print("3. Fetch data from API (requires backend server)")
    
    choice = input("Enter choice (1, 2, or 3): ").strip()
    
    users_to_analyze = []
    
    if choice == "2":
        print("\n📝 Manual data entry selected...")
        custom_data = get_user_input()
        if custom_data:
            users_to_analyze = [custom_data]
        else:
            print("❌ Failed to get manual input. Using sample data instead...")
            users_to_analyze = sample_users
            
    elif choice == "3":
        print("\n🌐 API data fetch selected...")
        username = get_username_input()
        
        api_user_data = fetch_user_from_api(username)
        if api_user_data:
            users_to_analyze = [api_user_data]
        else:
            print("❌ Failed to fetch from API. Using sample data instead...")
            users_to_analyze = sample_users
            
    else:
        print("\n📊 Using sample data...")
        users_to_analyze = sample_users
    
    # Analyze users
    print(f"\n🔬 Starting analysis for {len(users_to_analyze)} user(s)...")
    
    for user_data in users_to_analyze:
        print(f"\n🔍 Analyzing user: {user_data.username}")
        try:
            result = analyzer.analyze_user(user_data)
            print_analysis_results(result)
        except Exception as e:
            print(f"❌ Error analyzing {user_data.username}: {e}")
    
    print("\n🎯 Analysis complete! System ready for production use.")
    
    if choice == "3":
        print("\n💡 API Integration Notes:")
        print("• Make sure your backend server is running on http://localhost:3000")
        print("• API endpoint format: /leetcode/{username}")
        print("• You can analyze multiple users by running the script again")
        print("• Consider adding error handling for production use")