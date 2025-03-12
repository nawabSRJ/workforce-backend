import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import clientModel from '../models/Client.js';


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