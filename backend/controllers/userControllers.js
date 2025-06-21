const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const login=async(req,res)=>{
    try {
        const {email,password,role}=req.body;
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
            message: role +" logged in successfully",
            user: {
                token: token,
                role
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
const signup=async(req,res)=>{
 try {
    console.log("This is signup controller");
    const { username, email, password, leetcodeId, githubId, role } = req.body;
    const user=User.findOne({ email: email });
    if (user) {
        console.log("User already exists");
        return res.status(400).json({
            success: false,
            message: "User already exists"
        });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        leetcodeId,
        githubId,
        role
    });
    await newUser.save();
    console.log("User created successfully");
    const token = jwt.sign({ newUser}, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    });
    console.log("Token generated and cookie set",token);
    return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
            username : newUser.username,
            email : newUser.email,
            password : newUser.password,
            leetcodeId : newUser.leetcodeId,
            githubId : newUser.githubId,
            role
        } ,
        token
    });
} catch (error) {
    console.error("Error during signup:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
    });
 }
}

module.exports = {
    signup,
    login
};