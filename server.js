import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import mongodbURL from "./config.js";
import { verifyToken, clientLogin, clientSignup, freelancerLogin, freelancerSignUp } from './controllers/authController.js';
import { addReminder, getReminders } from './controllers/reminderController.js';
import { startReminderCron } from './cron.js';
import { applyForTask, newOpenTask } from "./controllers/openTaskController.js";
import { sendOpenTasks } from "./controllers/openTaskController.js";
import { sendFreelancersData } from "./controllers/sendFreelancers.js";
import { sendMessage, getMessages } from "./controllers/chatController.js";
import { getChats } from "./controllers/chatController.js";
import { createOrderFromChat, getClientOpenTasks } from './controllers/orderController.js';
import { createPrivateOrder, getClientPrivateOrders } from "./controllers/privateOrderController.js";
import Freelancer from './models/freelancer.js';
import Client from './models/Client.js';
import multer from 'multer';
import http from "http";
import { initChatService } from "./services/chatService.js";
import { getClientRequests, sendFreelancerRequest, updateRequestStatus } from "./controllers/freelancerRequestController.js";
import { updateClientProfile } from "./controllers/updateClient.js";

const port = process.env.port || 8000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ["https://workforce-frontend.vercel.app", "http://localhost:5173"],
  optionsSuccessStatus: 200,
  methods: ["POST", "GET", "PATCH","PUT"],
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
app.get('/get-reminders', getReminders);

// Multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 3
  }
});

// Open Task routes
app.post('/open-task', upload.array('samples'), newOpenTask);
app.post('/create-order', createOrderFromChat);
app.get('/open-tasks/:clientId', getClientOpenTasks);
app.get('/open-work', sendOpenTasks);
app.patch('/open-task/apply/:taskId', applyForTask);

// freelancer requests
app.post("/freelancer-request", sendFreelancerRequest);
app.get("/api/freelancer-requests/:clientId", getClientRequests); 
app.patch("/freelancer-request/:requestId", updateRequestStatus);


// Private Order routes
app.post('/private-tasks', upload.array('samples'), createPrivateOrder);
app.get('/private-tasks/:clientId', getClientPrivateOrders);

// Freelancers route
app.get('/freelancers', sendFreelancersData);

// Client Routes
app.put('/client/update-profile/:clientId', updateClientProfile);


// Chat HTTP routes
app.post('/send-message', sendMessage);
app.get('/messages/:user1/:user2', getMessages);
app.get('/chats/:userId', getChats);

// User info routes
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

// Start server + socket.io
const server = http.createServer(app);
initChatService(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
