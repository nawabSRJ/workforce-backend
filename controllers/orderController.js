import Project from '../models/projects.js';
import openTaskModel from '../models/OpenTask.js';
import PrivateTask from '../models/PrivateTask.js';
import mongoose from 'mongoose';
import clientModel from '../models/Client.js';

export const createOrderFromChat = async (req, res) => {
  console.log("--- createOrderFromChat STARTED ---");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  try {
    const { clientId, freelancerId, openTaskId, amount } = req.body;
    
    console.log("[createOrderFromChat] Request received with data:", { 
      clientId, 
      freelancerId, 
      openTaskId, 
      amount 
    });
    
    // Validate inputs
    if (!clientId || !freelancerId || !openTaskId || !amount) {
      console.log("[createOrderFromChat] Missing required fields");
      return res.status(400).json({
        success: false, 
        message: 'Missing required fields'
      });
    }
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(clientId) || 
        !mongoose.Types.ObjectId.isValid(freelancerId) || 
        !mongoose.Types.ObjectId.isValid(openTaskId)) {
      console.log("[createOrderFromChat] Invalid ID format");
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    // Fetch the open task
    const openTask = await openTaskModel.findById(openTaskId);
    if (!openTask) {
      console.log("[createOrderFromChat] Open task not found for ID:", openTaskId);
      return res.status(404).json({
        success: false,
        message: 'Open task not found'
      });
    }
    
    // Check if task is already accepted
    if (openTask.status === 'Accepted') {
      return res.status(400).json({
        success: false,
        message: 'This task has already been accepted'
      });
    }
    
    console.log("[createOrderFromChat] Found open task:", {
      id: openTask._id,
      title: openTask.projTitle,
      status: openTask.status
    });
    
    // Prepare project data
    const projectData = {
      clientId: new mongoose.Types.ObjectId(clientId),
      freelancerId: new mongoose.Types.ObjectId(freelancerId),
      openTaskId: new mongoose.Types.ObjectId(openTaskId),
      title: openTask.projTitle,
      description: openTask.description,
      category: openTask.category,
      references: Array.isArray(openTask.references) ? openTask.references : [],
      samples: Array.isArray(openTask.samples) ? openTask.samples : [],
      startDate: new Date(),
      dueDate: openTask.deadline,
      revisionsAllowed: openTask.revisionsAllowed || 3,
      revisionsLeft: openTask.revisionsAllowed || 3,
      amount: parseFloat(amount),
      paymentMethod: openTask.paymentMethod,
      status: 'Pending',
      freelancerNotes: openTask.freelancerNotes || '',
      clientNotes: ''
    };
    
    console.log("[createOrderFromChat] Creating project with data:", projectData);
    
    // Create the project
    const newProject = new Project(projectData);
    const savedProject = await newProject.save();
    
    console.log("[createOrderFromChat] Project created successfully:", savedProject._id);
    
    // Update the open task status to 'Accepted'
    openTask.status = 'Accepted';
    await openTask.save();
    
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      project: savedProject
    });
    
  } catch (error) {
    console.error('[createOrderFromChat] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};


export const getClientOpenTasks = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    console.log('Fetching open tasks for client ID:', clientId);

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    // First, get the client's email
    const client = await clientModel.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Now search by clientEmail instead of clientId
    const openTasks = await openTaskModel.find({ 
      clientEmail: client.email,
      status: { $nin: ['Accepted', 'Closed'] } // Exclude tasks that are already accepted or closed
    }).lean();

    console.log('Open tasks found:', openTasks);

    res.status(200).json(openTasks);
  } catch (error) {
    console.error('Error fetching open tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};