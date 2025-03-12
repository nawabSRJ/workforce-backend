// mgmt of reminders
import reminderModel from "../models/reminders.js";
import { sendEmail } from "./emailService.js";

// Create a new reminder
export const createReminder = async (reminderData) => {
    const reminder = new reminderModel({
        ...reminderData,
        sendAt: new Date(reminderData.sendAt),
        send: false
    });
    return await reminder.save();
};

// Send a reminder email
export const sendReminder = async (reminder) => {
    const emailSent = await sendEmail(
        reminder.email,
        `Reminder: ${reminder.title}`,
        `Hello ${reminder.username},\n\n${reminder.message}\n\nDue Date: ${reminder.sendAt}`
    );
    
    if (emailSent) {
        await reminderModel.updateOne({ _id: reminder._id }, { send: true });
        return true;
    }
    return false;
};

// Get pending reminders
export const getPendingReminders = async () => {
    return await reminderModel.find({ 
        send: false, 
        sendAt: { $lte: new Date() } 
    });
};

export default { createReminder, sendReminder, getPendingReminders };