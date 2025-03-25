import express from "express";
import cors from 'cors'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import mongodbURL from "./config.js";
import { verifyToken, clientLogin, clientSignup, freelancerLogin, freelancerSignUp } from './controllers/authController.js';
import { addReminder } from './controllers/reminderController.js';
import { startReminderCron } from './cron.js';
import { newOpenTask } from "./controllers/openTaskController.js";
import { sendOpenTasks } from "./controllers/openTaskController.js";
import { sendFreelancersData } from "./controllers/sendFreelancers.js";
import { sendMessage, getMessages } from "./controllers/chatController.js";
import { getChats } from "./controllers/chatController.js";
import http from "http";
import { Server } from "socket.io";


const port = process.env.port || 8000;

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    methods: ["POST", "GET"],
    credentials: true
}));

mongoose.connect(`${mongodbURL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

// Auth routes
app.post('/verifyToken', verifyToken);
app.post('/client-login', clientLogin);
app.post('/client-signup', clientSignup);

app.post('/freelancer-login', freelancerLogin);
app.post('/freelancer-signup', freelancerSignUp);



// Reminder routes
app.post('/add-reminder', addReminder);

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
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Socket.io connection
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("sendMessage", async (messageData) => {
        console.log("Received message via socket:", messageData);
        
        try {
            const { senderId, receiverId, senderModel, receiverModel, message } = messageData;
            
            // Create and save the message
            const newMessage = new Message({
                senderId,
                receiverId,
                senderModel,
                receiverModel,
                message,
                timestamp: new Date()
            });
            
            await newMessage.save();
            
            // Broadcast to all connected clients
            io.emit("receiveMessage", newMessage);
            
            console.log("Message broadcasted successfully");
        } catch (error) {
            console.error("Error processing socket message:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});


// Chat routes - updated paths to match frontend
app.post('/send-message', sendMessage);
app.get('/messages/:user1/:user2', getMessages);
app.get('/chats/:userId', getChats);

// Optional: Add routes to fetch user details
app.get('/freelancers/:id', async (req, res) => {
    try {
        const freelancer = await Freelancer.findById(req.params.id).select('name username');
        if (!freelancer) {
            return res.status(404).json({ error: "Freelancer not found" });
        }
        res.json(freelancer);
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

// -----------------------------


// Start cron jobs
startReminderCron();

// --------------------------------------------------------------------------------

// app.listen(port,()=>{
//     console.log(`Server is running on port ${port}`);    
// })  Not this because 👇

// This ensures both Express API & Socket.io run on the same server.
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
