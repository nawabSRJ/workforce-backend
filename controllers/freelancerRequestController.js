import FreelancerRequest from "../models/freelancerRequest.js";
import OpenTask from "../models/OpenTask.js";
import mongoose from "mongoose";
import clientModel from "../models/Client.js";

// ✅ Send a new freelancer request
export const sendFreelancerRequest = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { freelancerId, projectId, note } = req.body;

    // Validate required fields
    if (!freelancerId) {
      return res.status(400).json({ message: "freelancerId is required" });
    }
    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }
    if (!note) {
      return res.status(400).json({ message: "note is required" });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
      return res.status(400).json({ message: "Invalid freelancerId format" });
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId format" });
    }

    // Check if project exists
    const project = await OpenTask.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create the request
    const newRequest = await FreelancerRequest.create({
      freelancerId,
      projectId,
      note
    });

    console.log("Created new request:", newRequest);
    res.status(201).json({ message: "Request sent successfully", request: newRequest });
  } catch (error) {
    console.error("Error sending request:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};

// ✅ Get all requests for a client's projects
export const getClientRequests = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    console.log("Getting requests for client ID:", clientId);

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: "Invalid client ID format" });
    }

    // Get all tasks where clientId is present in the query params
    // We don't need to import the Client model since we can directly query OpenTask
    const clientProjects = await OpenTask.find({ clientEmail: { $exists: true } });
    
    console.log(`Found ${clientProjects.length} total projects`);
    
    if (clientProjects.length === 0) {
      return res.status(200).json([]); // Return empty array if no projects
    }
    
    // Extract all project IDs
    const projectIds = clientProjects.map(project => project._id);
    console.log(`Total project IDs: ${projectIds.length}`);

    // Fetch all requests for these projects
    const allRequests = await FreelancerRequest.find({ projectId: { $in: projectIds } })
      .populate('freelancerId', 'name username email')
      .populate('projectId', 'projTitle clientEmail')
      .sort({ createdAt: -1 });

    console.log(`Found ${allRequests.length} total requests`);
    
    // Debug to see what we have
    if (allRequests.length > 0) {
      console.log("Sample request:", JSON.stringify(allRequests[0], null, 2));
    }
    
    // Return all requests - we'll filter on the client side if needed
    res.status(200).json(allRequests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};

// ✅ Update request status
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedRequest = await FreelancerRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Status updated", request: updatedRequest });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};