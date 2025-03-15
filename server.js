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


// Start cron jobs
startReminderCron();

// --------------------------------------------------------------------------------

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);    
})