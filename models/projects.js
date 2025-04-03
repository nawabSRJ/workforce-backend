import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    // Project participants
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

    // Source open task (if converted from open task)
    openTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OpenTask'
    },

    // Project Details
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    references: [{ type: String }],
    samples: [{ type: String }], // Added samples from open task
    
    // Project Timeline
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    completeDate: { type: Date },
    
    // Project Status
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Completed', 'Revision Requested', 'Disputed'], 
        default: 'Pending' 
    },
    
    // Revisions
    revisionsAllowed: { type: Number, default: 3 },
    revisionsLeft: { type: Number, default: 3 },
    revisionRequests: [{
        description: String,
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
    }],
    
    // Financials
    amount: { type: Number, required: true, min: 50 },
    paymentMethod: { type: String, enum: ['UPI', 'Net Banking', 'Card'] },
    payments: [{
        amount: Number,
        date: Date,
        method: String,
        transactionId: String,
        status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' }
    }],
    
    // Communication
    freelancerNotes: { type: String, default: "" },
    clientNotes: { type: String, default: "" },
    messages: [{
        sender: { type: String, enum: ['client', 'freelancer'] },
        content: String,
        timestamp: { type: Date, default: Date.now },
        attachments: [{ type: String }]
    }],
    
    // Ratings
    clientRating: {
        score: { type: Number, min: 1, max: 5 },
        review: String
    },
    freelancerRating: {
        score: { type: Number, min: 1, max: 5 },
        review: String
    }
    
}, { timestamps: true });

// Add index for frequently queried fields - If removed, queries will still work but may be slower as the database grows.
ProjectSchema.index({ clientId: 1, status: 1 });
ProjectSchema.index({ freelancerId: 1, status: 1 });
ProjectSchema.index({ dueDate: 1 });

const Project = mongoose.model('Project', ProjectSchema);
export default Project;