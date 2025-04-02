import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import mongodbURL from "./config.js";
import { verifyToken, clientLogin, clientSignup, freelancerLogin, freelancerSignUp } from './controllers/authController.js';
import { addReminder, getReminders } from './controllers/reminderController.js';
import { startReminderCron } from './cron.js';
import { newOpenTask } from "./controllers/openTaskController.js";
import { sendOpenTasks } from "./controllers/openTaskController.js";
import { sendFreelancersData } from "./controllers/sendFreelancers.js";
import { sendMessage, getMessages } from "./controllers/chatController.js";
import { getChats } from "./controllers/chatController.js";
import http from "http";
import { Server } from "socket.io";
import Message from './models/messageModel.js'; // ADDED THIS IMPORT
import Freelancer from './models/freelancer.js'; // ADDED THIS IMPORT
import Client from './models/Client.js'; // ADDED THIS IMPORT

const port = process.env.port || 8000;

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ["https://workforce-frontend.vercel.app","http://localhost:5173"], // global,local
    optionsSuccessStatus: 200,
    methods: ["POST", "GET"],
    credentials: true,
    allowedHeaders: "Content-Type,Authorization"
}));
mongoose.connect(`${mongodbURL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Auth routes
app.post('/verifyToken', verifyToken);
app.post('/client-login', clientLogin);
app.post('/client-signup', clientSignup);
app.post('/freelancer-login', freelancerLogin);
app.post('/freelancer-signup', freelancerSignUp);

// Reminder routes
app.post('/add-reminder', addReminder);
app.get('/get-reminders', getReminders)


// new open task
app.post('/open-task', newOpenTask);

// sends the open tasks data to frontend
app.get('/open-work', sendOpenTasks);

// fetch freelancers
app.get('/freelancers', sendFreelancersData);
// ---------------------------- CHAT SYSTEM 
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://workforce-frontend.vercel.app","http://localhost:5173"], // global
        // origin: "http://localhost:5173",    // local
        methods: ["GET", "POST"]
    },
    connectionStateRecovery: { // ADDED FOR BETTER RECONNECT HANDLING
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    }
});

// Socket.io connection
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Store user ID for this socket connection
    let currentUserId = null;

    socket.on("joinUser", (userId) => {
        if (currentUserId) {
            socket.leave(currentUserId); // LEAVE PREVIOUS ROOM IF EXISTS
        }
        currentUserId = userId;
        socket.join(userId);
        console.log(`User ${userId} joined room (socket ${socket.id})`);
        
        // ADDED ACKNOWLEDGEMENT TO CLIENT
        socket.emit("joinedRoom", { success: true, userId });
    });

    socket.on("sendMessage", async (messageData, callback) => { // ADDED CALLBACK
        console.log("Received message via socket:", messageData);
        
        try {
            const { senderId, receiverId, senderModel, receiverModel, message } = messageData;
            
            // VALIDATE INPUTS
            if (!senderId || !receiverId || !senderModel || !receiverModel || !message) {
                throw new Error("Missing required message fields");
            }

            const newMessage = new Message({
                senderId,
                receiverId,
                senderModel,
                receiverModel,
                message,
                timestamp: new Date()
            });
            
            const savedMessage = await newMessage.save();
            console.log("Saved message to DB:", savedMessage);
            
            // Emit to specific user rooms only
            io.to(senderId).emit("receiveMessage", savedMessage);
            io.to(receiverId).emit("receiveMessage", savedMessage);
            
            console.log(`Message broadcasted to ${senderId} and ${receiverId}`);
            
            // ADDED ACKNOWLEDGEMENT
            if (callback) {
                callback({ success: true, message: savedMessage });
            }
        } catch (error) {
            console.error("Error processing socket message:", error);
            if (callback) {
                callback({ success: false, error: error.message });
            }
        }
    });

    socket.on("disconnect", (reason) => { // ADDED REASON LOGGING
        console.log(`User ${currentUserId || 'unknown'} disconnected (socket ${socket.id}): ${reason}`);
        if (currentUserId) {
            socket.leave(currentUserId);
        }
    });

    // ADDED ERROR HANDLER
    socket.on("error", (error) => {
        console.error(`Socket error for user ${currentUserId}:`, error);
    });
});

// Chat routes
app.post('/send-message', sendMessage);
app.get('/messages/:user1/:user2', getMessages);
app.get('/chats/:userId', getChats);

// User detail routes
app.get('/freelancers/:id', async (req, res) => {
    try {
        const freelancer = await Freelancer.findById(req.params.id)
            .select('name username totalEarnings completedProjects rating tags email phone');
        if (!freelancer) {
            return res.status(404).json({ error: "Freelancer not found" });
        }
        res.status(200).json(freelancer);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get('/clients/:id', async (req, res) => {
    try {
        const client = await Client.findById(req.params.id).select('name');
        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }
        res.json(client);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Start cron jobs
startReminderCron();

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});