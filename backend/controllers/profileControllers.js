const axios = require("axios");
const redisClient = require("../DB/redis"); // adjust the path if needed

const fetchProfile = async (req, res) => {
    try {
        const username = req.params.username;
        const redisKey = `user:leetcode:${username}`;
        console.log("🔍 Checking Redis for:", redisKey);

        // Check Redis cache
        if(redisKey){
        const cachedData = await redisClient.get(redisKey);
        if (cachedData) {
            console.log("✅ Found in Redis cache");
            return res.status(200).json({
                success: true,
                message: "Profile fetched from Redis cache",
                data: JSON.parse(cachedData),
            });
        }
    }
        // Fetch from external API
        const response = await axios.get(`http://localhost:3003/leetcode/${username}`);
        const userData = response.data?.data;

        // Only cache if valid data is returned
        if (!userData) {
            console.warn("⚠️ API returned no data or error field");
            return res.status(502).json({
                success: false,
                message: "Failed to fetch LeetCode data",
                error: "Empty or invalid response from LeetCode API"
            });
        }

        console.log("🌐 Fetched from API:", userData);

        // Cache in Redis (1 hour = 3600 seconds)
        await redisClient.setex(redisKey, 3600, JSON.stringify(userData));

        return res.status(200).json({
            success: true,
            message: "Profile fetched from API",
            data: userData,
        });
    } catch (error) {
        console.error("❌ Error fetching profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


const analyzeProfile = async (req, res) => {
    try {
        const username = req.params.username;
        const redisKey = `analysis:leetcode:${username}`;
        
        console.log("🔍 Checking Redis for analysis:", redisKey);
        
        // Check Redis cache
        const cachedAnalysis = await redisClient.get(redisKey);
        if (cachedAnalysis) {
            console.log("✅ Found analysis in Redis");
            return res.status(200).json({
                success: true,
                message: "Profile analysis fetched from Redis cache",
                data: JSON.parse(cachedAnalysis),
            });
        }
        
        console.log("🌐 Cache miss, fetching from API...");
        
        // Fetch from Flask backend
        const analysisResponse = await axios.get(`http://127.0.0.1:3002/analyze/${username}`);
        const result = analysisResponse.data;
        
        // Validate and cache only if successful
        if (!result || !result.success || !result.data) {
            console.warn("⚠️ Invalid or failed analysis result");
            return res.status(502).json({
                success: false,
                message: "Failed to analyze profile",
                error: result?.error || "Invalid analysis response"
            });
        }
        
        console.log("✅ Fetched analysis from API:", result.data);
        
        // Cache the complete response structure, not just result.data
        const responseToCache = {
            success: true,
            message: "Profile analysis fetched from API",
            data: result.data,
        };
        
        // Cache the complete response for consistency
        await redisClient.setex(redisKey, 3600, JSON.stringify(responseToCache));
        
        return res.status(200).json(responseToCache);
        
    } catch (error) {
        console.error("❌ Error analyzing profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = {
    fetchProfile,
    analyzeProfile
};