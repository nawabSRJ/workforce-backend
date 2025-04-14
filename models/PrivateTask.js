// models/PrivateTask.js
import mongoose from "mongoose";

const PrivateTaskSchema = new mongoose.Schema({
    clientId: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Client'
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Freelancer'
    },
    category: { type: String, required: true },
    projTitle: { type: String, required: true },
    description: { type: String, required: true },
    references: [{ type: String }],
    samples: [{ type: String }],
    deadline: { type: Date, required: true },
    revisionsAllowed: { 
        type: Number, 
        required: true, 
        default: 3,
        min: 0 
    },
    budgetAmount: {
        type: Number,
        required: true,
        default: 50,
        min: 50
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['UPI', 'Net Banking', 'Card']
    },
    freelancerNotes: { type: String, default: "" },
    freelancerQues: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const PrivateTask = mongoose.model('PrivateTask', PrivateTaskSchema);
export default PrivateTask;