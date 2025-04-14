import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema({
     // Personal Information
     name: { type: String, required: true },
     email: { type: String, required: true, unique: true },
     password: { type: String, required: true },
     gender: { type: String, required: true },
     dateOfBirth: { type: Date, required: true },
     
     // Professional Information
     username: { type: String, required: true, unique: true },
     bio: { type: String, default: "" },
     tags: [{ type: String, required: true }],
     services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
     portfolioWebsite: { type: String, default: "" },
     linkedIn: { type: String, default: "" },
     twitter: { type: String, default: "" },
     
     // Contact Information
     country: { type: String, required: true },
     phone: { 
         code: { type: String, required: true },
         number: { type: String, required: true, unique: true }
     },
     
     // Statistics
     rating: { type: Number, default: 0 },
     totalEarnings: { type: Number, default: 0 },
     completedProjects: { type: Number, default: 0 },
     
     // System Fields
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now }
})

const freelancerModel = mongoose.model('Freelancer',freelancerSchema);

export default freelancerModel;