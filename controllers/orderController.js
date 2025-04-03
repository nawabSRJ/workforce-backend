import Project from '../models/projects.js';
import OpenTask from '../models/OpenTask.js';
import mongoose from 'mongoose';

export const createOrderFromChat = async (req, res) => {
    try {
        const { clientId, freelancerId, openTaskId, amount } = req.body;

        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(clientId) || 
            !mongoose.Types.ObjectId.isValid(freelancerId) ||
            !mongoose.Types.ObjectId.isValid(openTaskId)) {
            return res.status(400).json({ error: "Invalid IDs provided" });
        }

        // Get the open task details
        const openTask = await OpenTask.findById(openTaskId);
        if (!openTask) {
            return res.status(404).json({ error: "Open task not found" });
        }

        // Create new project
        const newProject = new Project({
            clientId,
            freelancerId,
            openTaskId,
            title: openTask.projTitle,
            description: openTask.description,
            category: openTask.category,
            references: openTask.references,
            samples: openTask.samples,
            dueDate: openTask.deadline,
            revisionsAllowed: openTask.revisionsAllowed,
            amount: amount || openTask.budgetAmount,
            status: 'Pending'
        });

        await newProject.save();

        // Update open task status
        openTask.status = 'Accepted';
        await openTask.save();

        res.status(201).json({
            success: true,
            project: newProject
        });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getClientOpenTasks = async (req, res) => {
    try {
        const clientId = req.params.clientId;
        console.log('Fetching open tasks for client ID:', clientId);

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        const openTasks = await OpenTask.find({ clientId: clientId, isOpen: true }).lean();
        console.log('Open tasks found:', openTasks);

        if (openTasks.length === 0) {
            return res.status(404).json({ message: 'No open tasks found' });
        }

        res.status(200).json(openTasks);
    } catch (error) {
        console.error('Error fetching open tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};