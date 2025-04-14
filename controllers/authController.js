// ?for : freelancer and client auth (signup + login)
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
    console.log("Received client login data:", req.body); // Log incoming data for debugging
    
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }

        // Find client by email
        const client = await clientModel.findOne({ email });

        if (!client) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'No account found with this email',
                cli: false 
            });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, client.password);

        if (isPasswordValid) {
            const token = jwt.sign(
                { 
                    id: client._id,
                    name: client.name, 
                    email: client.email 
                },
                SECRET_KEY,
                { expiresIn: "1h" }
            );

            // Send a more comprehensive client object but exclude sensitive data
            const clientInfo = {
                id: client._id,
                name: client.name,
                email: client.email,
                phone: client.phone,
                gender: client.gender,
                projectsPosted: client.projectsPosted,
                projectsCompleted: client.projectsCompleted,
                totalExpense: client.totalExpense,
                orders: client.orders // Contains order references
            };

            return res.json({ 
                status: 'ok', 
                message: 'Success',
                cli: token, 
                user: clientInfo
            });
        } else {
            return res.status(401).json({ 
                status: 'error', 
                message: 'Invalid password',
                cli: false 
            });
        }
    } catch (error) {
        console.error("Client login error:", error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'An error occurred during login. Please try again.',
            cli: false 
        });
    }
};



export const clientSignup = async (req, res) => {
    try {
        // ? validation
        if (!req.body.name || !req.body.email || !req.body.password || !req.body.gender || !req.body.phone) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields (name, email, password, gender, phone) are required'
            });
        }

        // Check if email or phone already exists
        const existingClient = await clientModel.findOne({
            $or: [
                { email: req.body.email },
                { phone: req.body.phone }
            ]
        });

        if (existingClient) {
            return res.status(400).json({
                status: 'error',
                message: existingClient.email === req.body.email 
                    ? 'Email already in use' 
                    : 'Phone number already in use'
            });
        }

        // Hash password
        const newPassword = await bcrypt.hash(req.body.password, 10);

        // Create new client with all required fields
        const newClient = await clientModel.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword,
            gender: req.body.gender,
            phone: req.body.phone,
            // These fields will use their default values
            projectsPosted: 0,
            projectsCompleted: 0,
            totalExpense: 0,
            orders: []
        });

        res.json({ 
            status: 'ok',
            message: 'Account created successfully',
            user: {
                id: newClient._id,
                name: newClient.name,
                email: newClient.email,
                gender: newClient.gender,
                phone: newClient.phone
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ 
            status: 'error',
            message: 'An error occurred during signup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ------------------------------- Freelancer Auth

// Freelancer SignUp
export const freelancerSignUp = async (req, res) => {
    console.log("Received signup data:", req.body);

    try {
        const { 
            name, 
            email, 
            password, 
            username, 
            gender, 
            tags, 
            dateOfBirth, 
            country,
            bio,
            phone,
            portfolioWebsite,
            linkedIn,
            twitter
        } = req.body;

        // Validation of fields
        const requiredFields = {
            name,
            email,
            password,
            username,
            gender,
            tags,
            dateOfBirth,
            country,
            bio,
            phoneCode: phone?.code,
            phoneNumber: phone?.number
        };

        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value || (Array.isArray(value) && value.length === 0)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Missing required field: ${field.replace('phoneCode', 'phone code').replace('phoneNumber', 'phone number')}`
                });
            }
        }

        // Validate date format
        if (isNaN(new Date(dateOfBirth).getTime())) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid date of birth format'
            });
        }

        // Check existing records
        const [existingEmail, existingUsername, existingPhone] = await Promise.all([
            freelancerModel.findOne({ email }),
            freelancerModel.findOne({ username }),
            freelancerModel.findOne({ 'phone.number': phone.number })
        ]);

        if (existingEmail) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already in use'
            });
        }

        if (existingUsername) {
            return res.status(400).json({
                status: 'error',
                message: 'Username already in use'
            });
        }

        if (existingPhone) {
            return res.status(400).json({
                status: 'error',
                message: 'Phone number already in use'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new freelancer
        const newFreelancer = new freelancerModel({
            name,
            email,
            password: hashedPassword,
            username,
            gender,
            tags,
            dateOfBirth: new Date(dateOfBirth),
            country,
            bio,
            phone: {
                code: phone.code,
                number: phone.number
            },
            portfolioWebsite: portfolioWebsite || '',
            linkedIn: linkedIn || '',
            twitter: twitter || '',
            rating: 0,
            services: [],
            createdAt: new Date()
        });

        await newFreelancer.save();

        return res.status(201).json({
            status: 'ok',
            message: 'Signup successful!',
            user: {
                name,
                email,
                username
            }
        });

    } catch (error) {
        console.error("Signup error:", error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const fieldMap = {
                'email': 'Email',
                'username': 'Username',
                'phone.number': 'Phone number'
            };
            
            return res.status(400).json({ 
                status: 'error',
                message: `${fieldMap[field] || field} already exists`
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                status: 'error',
                message: errors.join(', ')
            });
        }

        // Handle invalid date error
        if (error.name === 'CastError' && error.path === 'dateOfBirth') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid date format for date of birth'
            });
        }

        // Generic server error
        return res.status(500).json({ 
            status: 'error',
            message: 'Internal server error. Please try again later.'
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
                rating: freelancer.rating,
                totalEarnings:freelancer.totalEarnings,
                completedProjects:freelancer.completedProjects
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