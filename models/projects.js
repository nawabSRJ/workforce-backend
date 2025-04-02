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

    // Project Details
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    references: [{ type: String }], // Array of strings for multiple links
    
    // Project Timeline
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    completeDate: { type: Date },
    
    // Project Status
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Completed', 'Revision Requested'], 
        default: 'Pending' 
    },
    
    // Revisions
    revisionsAllowed: { type: Number, default: 3 },
    revisionsLeft: { type: Number, default: 3 },
    
    // Financials
    amount: { type: Number, required: true, min: 50 }, // minimum 50 INR
    
    // Communication
    freelancerNotes: { type: String, default: "" },
    clientNotes: { type: String, default: "" },
    
}, { timestamps: true });

const Project = mongoose.model('Project', ProjectSchema);
export default Project;