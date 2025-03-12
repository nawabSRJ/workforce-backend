// for email sending logic of reminders
import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "srajan.saxena7@gmail.com",
        pass: "qpwm wfoz zrnq hflk"  // todo : switch to env variables
    }
});

// Function to send emails
export const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: "srajan.saxena7@gmail.com",
            to,
            subject,
            text
        });
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export default { sendEmail };