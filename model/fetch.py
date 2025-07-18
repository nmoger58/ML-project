from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
import uvicorn
import httpx
import json
import re
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Data Models
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
                {'title': 'Contains Duplicate', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/contains-duplicate/'},
                {'title': 'Product of Array Except Self', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/product-of-array-except-self/'},
                {'title': 'Merge Intervals', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/merge-intervals/'},
                {'title': 'Median of Two Sorted Arrays', 'difficulty': 'Hard', 'url': 'https://leetcode.com/problems/median-of-two-sorted-arrays/'}
            ],
            'Dynamic Programming': [
                {'title': 'Climbing Stairs', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/climbing-stairs/'},
                {'title': 'House Robber', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/house-robber/'},
                {'title': 'Longest Increasing Subsequence', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/longest-increasing-subsequence/'},
                {'title': 'Coin Change', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/coin-change/'},
                {'title': 'Word Break', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/word-break/'},
                {'title': 'Edit Distance', 'difficulty': 'Hard', 'url': 'https://leetcode.com/problems/edit-distance/'}
            ],
            'Hash Table': [
                {'title': 'Valid Anagram', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/valid-anagram/'},
                {'title': 'Group Anagrams', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/group-anagrams/'},
                {'title': 'Top K Frequent Elements', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/top-k-frequent-elements/'},
                {'title': 'Two Sum', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/two-sum/'},
                {'title': 'Longest Consecutive Sequence', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/longest-consecutive-sequence/'}
            ],
            'String': [
                {'title': 'Valid Anagram', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/valid-anagram/'},
                {'title': 'Longest Substring Without Repeating Characters', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'},
                {'title': 'Valid Palindrome', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/valid-palindrome/'},
                {'title': 'Implement strStr()', 'difficulty': 'Easy', 'url': 'https://leetcode.com/problems/implement-strstr/'},
                {'title': 'Longest Palindromic Substring', 'difficulty': 'Medium', 'url': 'https://leetcode.com/problems/longest-palindromic-substring/'}
            ]
        }

    def parse_user_data(self, data: LeetCodeUserData) -> ProcessedUserData:
        """Parse and process raw user data"""
        try:
            # Parse rank
            rank_numeric = int(data.rank.replace(',', '')) if data.rank and data.rank != 'N/A' else 1000000
            
            # Parse total questions
            solved, total = map(int, data.totalQuestions.split('/'))
            solve_ratio = solved / total if total > 0 else 0
            
            # Parse skills
            topic_scores = {}
            for skill in data.skills:
                match = re.match(r'(.+?)x(\d+)', skill)
                if match:
                    topic, count = match.groups()
                    topic_scores[topic.strip()] = int(count)
            
            # Calculate metrics
            topic_diversity = len(topic_scores) / 20 if topic_scores else 0
            advanced_topics = sum(1 for topic in topic_scores.keys() 
                                if self.topic_difficulty.get(topic, 3) >= 4)
            advanced_topics_ratio = advanced_topics / len(topic_scores) if topic_scores else 0
            
            # Parse submissions
            submissions_count = int(data.submissions) if data.submissions.isdigit() else 0
            
            # Parse active days
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
        solve_ratio_score = min(processed_data.solve_ratio * 100 * 0.5, 50)
        activity_score = min(processed_data.active_days * 0.5, 20)
        diversity_score = processed_data.topic_diversity * 15
        advanced_score = processed_data.advanced_topics_ratio * 15
        
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
        elif level == "Intermediate":
            roadmap.append("🎯 Phase 1 (Weeks 1-2): Strengthen core algorithmic thinking")
            roadmap.append("   Target: Mix of 15 Easy + 10 Medium problems")
        else:
            roadmap.append("🎯 Phase 1 (Weeks 1-2): Advanced problem-solving patterns")
            roadmap.append("   Target: Focus on Hard problems and optimization techniques")
        
        if weak_areas:
            main_weak_area = weak_areas[0]
            roadmap.append(f"🔍 Phase 2 (Weeks 3-4): Deep dive into {main_weak_area}")
            roadmap.append(f"   Target: Complete 15+ {main_weak_area} problems")
        
        roadmap.append("🚀 Phase 3 (Weeks 5-6): Introduction to Dynamic Programming and Graphs")
        roadmap.append("🎪 Phase 4 (Weeks 7-8): Mixed problem solving and contest participation")
        
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

# Data cleaning functions
def clean_api_data(raw_data: str) -> str:
    """Clean data from API by removing newlines and extra text"""
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
    """Parse totalQuestions field from API format"""
    cleaned = clean_api_data(total_questions_str)
    if '/' in cleaned:
        match = re.search(r'(\d+/\d+)', cleaned)
        if match:
            return match.group(1)
    return cleaned

def parse_submissions(submissions_str: str) -> str:
    """Parse submissions field to extract just the number"""
    cleaned = clean_api_data(submissions_str)
    match = re.search(r'[\d,]+', cleaned)
    if match:
        return match.group(0).replace(',', '')
    return "0"

def parse_streak(streak_str: str) -> str:
    """Parse streak field to extract just the number"""
    cleaned = clean_api_data(streak_str)
    match = re.search(r'\d+', cleaned)
    if match:
        return f"Total active days:{match.group(0)}"
    return "Total active days:0"

from fastapi.middleware.cors import CORSMiddleware
# FastAPI app
app = FastAPI(title="LeetCode Analyzer API", version="1.0.0")
analyzer = LeetCodeAnalyzer()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],        # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],        # Allow all headers
)
class AnalysisResponse(BaseModel):
    status: bool
    data: Optional[Dict] = None
    error: Optional[str] = None

@app.get("/analyze/{username}", response_model=AnalysisResponse)
async def analyze_user(username: str):
    """
    Analyze a LeetCode user's performance by fetching data from external API
    """
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")
    
    try:
        print(f"🔍 Fetching data for user: {username}")
        
        # Fetch user data from the external API
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://localhost:3003/leetcode/{username}")
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Failed to fetch user data: {response.text}"
                )
            
            api_response = response.json()
            
            if not api_response.get("success"):
                raise HTTPException(
                    status_code=404, 
                    detail=f"User data not found: {api_response.get('message', 'Unknown error')}"
                )
            
            raw_user_data = api_response.get("data")
            if not raw_user_data:
                raise HTTPException(status_code=404, detail="No user data found")
        
        # Clean and process the API data
        cleaned_rank = clean_api_data(raw_user_data.get("rank", ""))
        cleaned_total_questions = parse_total_questions(raw_user_data.get("totalQuestions", ""))
        cleaned_submissions = parse_submissions(raw_user_data.get("submissions", ""))
        cleaned_streak = parse_streak(raw_user_data.get("streak", ""))
        
        # Create LeetCodeUserData object
        user_data = LeetCodeUserData(
            username=raw_user_data.get("username", ""),
            rank=cleaned_rank,
            totalQuestions=cleaned_total_questions,
            languages=raw_user_data.get("languages", []),
            skills=raw_user_data.get("skills", []),
            submissions=cleaned_submissions,
            streak=cleaned_streak
        )
        
        print(f"✅ Successfully processed data for {username}")
        
        # Analyze the user data
        result = analyzer.analyze_user(user_data)
        
        result_dict = {
            "username": result.username,
            "rank": cleaned_rank,
            "performance_score": result.performance_score,
            "topic_proficiency": result.topic_proficiency,
            "weak_areas": result.weak_areas,
            "recommendations": result.recommendations,
            "suggested_problems": result.suggested_problems,
            "improvement_roadmap": result.improvement_roadmap
        }
        
        return AnalysisResponse(status=True, data=result_dict)
        
    except HTTPException:
        raise
    except httpx.RequestError as e:
        print(f"❌ Network error: {str(e)}")
        raise HTTPException(
            status_code=503, 
            detail=f"Failed to connect to data source: {str(e)}"
        )
    except Exception as e:
        print(f"❌ Error analyzing user {username}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "LeetCode Analyzer API is running"}

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=3002)