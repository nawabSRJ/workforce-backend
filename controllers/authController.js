import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import clientModel from '../models/Client.js';
import freelancerModel from "../models/freelancer.js";


const SECRET_KEY = "secret123"; 

export const verifyToken = async (req, res) => {
    const token = req.body.token;
    if (!token) return res.json({ status: 'error' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ status: 'ok', user: decoded.name });
    } catch (err) {
        res.json({ status: 'error' });
    }
};

// ----------------------- Client Auth
export const clientLogin = async (req, res) => {
    const cli = await clientModel.findOne({ email: req.body.email });

    if (!cli) {
        return res.json({ status: 'error', cli: false });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, cli.password);
    if (isPasswordValid) {
        const token = jwt.sign(
            { name: cli.name, email: cli.email },
            SECRET_KEY,
            { expiresIn: "1h" }
        );
        return res.json({ status: 'ok', cli: token, user: cli.name });
    } else {
        return res.json({ status: 'error', cli: false });
    }
};

export const clientSignup = async (req, res) => {
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10);
        await clientModel.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword
        });
        res.json({ status: 'ok' });
    } catch (error) {
        console.log(error);
        res.json({ status: 'error' });
    }
};

// ------------------------------- Freelancer Auth

// Freelancer SignUp
export const freelancerSignUp = async(req, res) => {
    console.log("Received signup data:", req.body); // Log incoming data for debugging
    
    try {
        // Check if required fields are present
        const { name, email, password, username, phone, gender, tags } = req.body;
        
        if (!name || !email || !password || !username || !phone || !gender || !tags) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required'
            });
        }
        
        // Check if email already exists
        const existingEmail = await freelancerModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already in use'
            });
        }
        
        // Check if username already exists
        const existingUsername = await freelancerModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                status: 'error',
                message: 'Username already in use'
            });
        }
        const existingPhoneNumber = await freelancerModel.findOne({phone});
        if(existingPhoneNumber){
            return res.status(400).json({
                status:'error',
                message:'Phone number already in use',
            })
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create the new freelancer document
        const newFreelancer = new freelancerModel({
            name,
            email,
            password: hashedPassword,
            username,
            phone,
            gender, // Added gender field
            tags,
            rating: 0,
            services: req.body.services || [],
        });
        
        // Save the new freelancer
        await newFreelancer.save();
        
        // Return success response
        return res.status(201).json({
            status: 'ok',
            message: 'Signup successful!',
            user: name
        });
    } catch (error) {
        console.error("Signup error:", error);
        
        // Improved error handling with more specific error messages
        if (error.code === 11000) {
            // Handle duplicate key error (email or username already exists)
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                status: 'error',
                message: `This ${field} is already in use. Please try another one.`
            });
        }
        
        // Return validation errors if present
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                status: 'error',
                message: errors.join(', ')
            });
        }
        
        // Generic error
        return res.status(500).json({ 
            status: 'error',
            message: 'An error occurred during signup. Please try again.'
        });
    }
};

// Freelancer Login Controller
export const freelancerLogin = async (req, res) => {
    console.log("Received login data:", req.body); // Log incoming data for debugging
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }
        
        const freelancer = await freelancerModel.findOne({ email });
        
        if (!freelancer) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'No account found with this email',
                freelancer: false 
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, freelancer.password);
        
        if (isPasswordValid) {
            const token = jwt.sign(
                { 
                    id: freelancer._id,
                    name: freelancer.name, 
                    email: freelancer.email 
                },
                SECRET_KEY,
                { expiresIn: "1h" }
            );
            
            // Send a more comprehensive user object but exclude sensitive data
            const userInfo = {
                id: freelancer._id,
                name: freelancer.name,
                email: freelancer.email,
                username: freelancer.username,
                phone: freelancer.phone,
                tags: freelancer.tags,
                rating: freelancer.rating
            };
            
            return res.json({ 
                status: 'ok', 
                message: 'Success',
                freelancer: token, 
                user: userInfo
            });
        } else {
            return res.status(401).json({ 
                status: 'error', 
                message: 'Invalid password',
                freelancer: false 
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'An error occurred during login. Please try again.',
            freelancer: false 
        });
    }
};