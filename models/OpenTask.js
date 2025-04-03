import mongoose from "mongoose";

const OpenTaskSchema = new mongoose.Schema({
    
    // Client Information
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true, match: /.+\@.+\..+/ },

    // Project Details
    category: { type: String, required: true },
    projTitle: { type: String, required: true },
    description: { type: String, required: true },
    references: [{ type: String }],  // Array of strings for multiple links
    samples: [{ type: String }],     // Array of URLs for uploaded files
    deadline: { type: Date, required: true },
    revisionsAllowed: { 
        type: Number, 
        required: true, 
        default: 3,
        min: 0 
    },

    // Budget & Pricing
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

    // Extras
    freelancerNotes: { type: String, default: "" },
    freelancerQues: { type: String, default: "" },

    // Status
    status: {
        type: String,
        enum: ['Open', 'In Discussion', 'Accepted', 'Closed'],
        default: 'Open'
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

}, { timestamps: true });

// Update the updatedAt field before saving
OpenTaskSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const openTaskModel = mongoose.model('OpenTask', OpenTaskSchema);
export default openTaskModel;