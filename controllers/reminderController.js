// ?for : adding new reminders
import reminderModel from "../models/reminders.js";
import { createReminder } from "../services/reminderService.js";

export const addReminder = async (req, res) => {
    try {
        const { username, email, phone, title, message, sendAt } = req.body;
        
        await createReminder({
            username,
            email,
            phone,
            title,
            message,
            sendAt
        });
        
        res.json({ status: "ok", message: "Reminder saved!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "Error saving reminder." });
    }
};

// fetches reminders based on the username, thus helps us not implement reminders in freelancer model
export const getReminders = async(req, res) => {
    try {
        // For GET requests, we use req.query instead of req.body
        const { username } = req.query;
        
        if(!username) {
            return res.status(400).json({ 
                success: false,
                message: "Username is required as query parameter" 
            });
        }
        
        const data = await reminderModel.find({ username });
        return res.status(200).json({ success: true, reminders: data });
    } catch (error) {
        console.error("Error fetching reminders:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};




export default { addReminder,getReminders };