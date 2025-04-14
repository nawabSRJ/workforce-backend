import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true
    },
    receiverId: {
        type: String,
        required: true
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Client', 'Freelancer']
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['Client', 'Freelancer']
    },
    message: {
        type: String,
        required: true
    },
    type: { type: String, enum: ['message', 'request'], default: 'message' },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;