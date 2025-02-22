import express from "express";
import jwt from "jsonwebtoken";
import cors from 'cors'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import mongodbURL from "./config.js";
import clientModel from './models/client.js';
import bcrypt from "bcryptjs";


const port = process.env.port || 8000;
const SECRET_KEY = 'secret123';
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

app.post('/verifyToken', (req, res) => {
    const token = req.body.token;
    if (!token) return res.json({ status: 'error' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ status: 'ok', user: decoded.name });
    } catch (err) {
        res.json({ status: 'error' });
    }
});

// login
app.post('/client-login', async (req,res,next)=>{
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
})

// sign-up 
app.post('/client-signup', async (req,res,next)=>{
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
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);    
})