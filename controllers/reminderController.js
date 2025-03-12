// adding new reminders
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

export default { addReminder };