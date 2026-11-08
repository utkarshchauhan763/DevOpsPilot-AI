const User = require("../models/user.model");
const sendResponse = require("../utils/response");
const config = require("../config/env");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const registerUser = async(req,res,next)=> {
    try{
        const{ name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if(existingUser){
            const error = new Error("Email is already registerd");
            error.statusCode = 400;
            throw error;
        }
        const user = await User.create({
            name,
            email,
            password
        });

        const safeUser = user.toObject();
        delete safeUser.password;

        return sendResponse(res,201,"User registered successfully",safeUser);

    }
    catch(error){
        if(error.code === 11000){
            error.statusCode = 409;
            error.message = "Email is already registered";
        }
        if(error.name === "ValidationError"){
            error.statusCode = 400;
        }
        next(error);
    }
};


const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user and explicitly include password hash
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            throw error;
        }

        // Compare entered password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            throw error;
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            config.jwtSecret,
            {
                expiresIn: config.jwtExpiresIn
            }
        );

        return sendResponse(res, 200, "Login successful", {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};


const getCurrentUser = async(req,res,next) => {
    try{
        const user = await User.findById(req.user.userId);
        if(!user){
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        return sendResponse(
            res,
            200,
            "User profile fetched successfully",
            user
        );
    }catch(error){
        next(error);
    }
};

module.exports = { registerUser,loginUser,getCurrentUser };