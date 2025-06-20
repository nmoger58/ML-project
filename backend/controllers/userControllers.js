const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const login=(req,res)=>{
    try {
        const {email,password}=req.body;
        const user = User.findOne({ email: email})
        if(!user){
            console.log("User not found");
            return res.status(404).json({
                success: false,
                message : "User not found"
            })
        }
        const isMatch = bcrypt.compareSync(password, user.password);
        if(!isMatch){
            console.log("Invalid password");
            return res.status(400).json({
                success: false,
                message : "Invalid password"
            })
        }
        console.log("Login successful");
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        });
        console.log("Token generated and cookie set",token);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                token: token,
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


module.exports = {
    login
};