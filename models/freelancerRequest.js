import mongoose from "mongoose";

const freelancerRequestSchema = new mongoose.Schema({
  freelancerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Freelancer", 
    required: true 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "OpenTask", 
    required: true 
  },
  note: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const FreelancerRequest = mongoose.model('FreelancerRequest', freelancerRequestSchema);
export default FreelancerRequest;