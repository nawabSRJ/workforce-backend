// ?for : sends chat list, sends msgs, sends all msgs

import Freelancer from "../models/freelancer.js";
import Client from "../models/Client.js";
import Message from '../models/messageModel.js';

// ? Get all chats for a user
export const getChats = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        console.log(`Fetching chats for user: ${userId}`);

        // Find distinct chat partners
        const chats = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                }
            },
            {
                $sort: { timestamp: -1 } // Sort by newest first
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", userId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessage: { $first: "$message" },
                    timestamp: { $first: "$timestamp" },
                    userType: { 
                        $first: { 
                            $cond: [
                                { $eq: ["$senderId", userId] },
                                "$receiverModel",
                                "$senderModel"
                            ]
                        }
                    }
                }
            },
            {
                $sort: { timestamp: -1 } // Sort by latest message
            },
            {
                $project: {
                    _id: "$_id",
                    lastMessage: 1,
                    timestamp: 1,
                    userType: 1
                }
            }
        ]);

        console.log(`Found ${chats.length} chats`);
        
        // For each chat, add the user details
        for (let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            const chatPartnerId = chat._id;
            const userType = chat.userType;
            
            try {
                let userDetails;
                if (userType === 'Freelancer') {
                    userDetails = await Freelancer.findById(chatPartnerId).select('name username');
                } else if (userType === 'Client') {
                    userDetails = await Client.findById(chatPartnerId).select('name');
                }
                
                if (userDetails) {
                    chat.name = userDetails.name || userDetails.username || 'Unknown User';
                } else {
                    chat.name = 'Unknown User';
                }
            } catch (error) {
                console.error(`Error fetching details for user ${chatPartnerId}:`, error);
                chat.name = 'Unknown User';
            }
        }

        // Add additional logging to debug response format
        console.log("Sending chat data to client:", JSON.stringify(chats.slice(0, 2)));
        
        res.json(chats);
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

// ? Send a message
export const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, senderModel, receiverModel, message } = req.body;

        console.log("Sending message:", req.body);

        if (!senderId || !receiverId || !senderModel || !receiverModel || !message) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Ensure senderModel and receiverModel are valid
        if (!['Freelancer', 'Client'].includes(senderModel) || !['Freelancer', 'Client'].includes(receiverModel)) {
            return res.status(400).json({ error: "Invalid user type." });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            senderModel,
            receiverModel,
            message,
            timestamp: new Date()
        });

        await newMessage.save();
        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

// ? Get messages between two users
export const getMessages = async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        console.log(`Fetching messages between ${user1} and ${user2}`);

        if (!user1 || !user2) {
            return res.status(400).json({ error: "Both user IDs are required" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ timestamp: 1 });

        console.log(`Found ${messages.length} messages`);
        
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};