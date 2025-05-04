// controllers/projectController.js
import Project from '../models/projects.js';
import Freelancer from '../models/freelancer.js';
import Client from '../models/Client.js';

export const getFreelancerProjects = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Find freelancer by username to get their ID
        const freelancer = await Freelancer.findOne({ username });
        if (!freelancer) {
            return res.status(404).json({ error: "Freelancer not found" });
        }

        // Get projects with client details
        const projects = await Project.find({ freelancerId: freelancer._id })
            .populate({
                path: 'clientId',
                select: 'name',
                model: 'Client'
            })
            .sort({ createdAt: -1 });

        // Format the response with null checks
        const formattedProjects = projects.map(project => {
            // Safely handle cases where client might not be found
            const clientName = project.clientId?.name || 'Unknown Client';
            
            return {
                _id: project._id,
                title: project.title,
                description: project.description,
                tags: project.tags || [],
                clientName,
                dueDate: project.dueDate,
                progress: project.progress || 0,
                amount: project.amount || 0,
                status: project.status || 'Pending',
                completeDate: project.completeDate,
                revisionsAllowed: project.revisionsAllowed || 0,
                revisionsLeft: project.revisionsLeft || 0,
                startDate: project.startDate
            };
        });

        res.status(200).json(formattedProjects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ 
            error: "Server error",
            details: error.message 
        });
    }
};

// done by the freelancer only
export const updateProjectProgress = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { progress } = req.body;

        // Validate progress value
        if (progress === undefined || progress < 0 || progress > 100) {
            return res.status(400).json({ error: "Progress must be between 0 and 100" });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { progress },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Error updating project progress:', error);
        res.status(500).json({ error: "Server error" });
    }
};

// * ----------------------------- For Client ------------------------
// Add to projectController.js
export const getClientProjects = async (req, res) => {
    try {
        const { clientId } = req.params;

        // Get projects with freelancer details
        const projects = await Project.find({ clientId })
            .populate('freelancerId', 'name username')
            .sort({ createdAt: -1 });

        // Format the response
        const formattedProjects = projects.map(project => ({
            _id: project._id,
            title: project.title,
            description: project.description,
            tags: project.tags,
            freelancerName: project.freelancerId?.name || 'Freelancer',
            freelancerUsername: project.freelancerId?.username || '',
            dueDate: project.dueDate,
            progress: project.progress,
            amount: project.amount,
            status: project.status,
            completeDate: project.completeDate,
            revisionsAllowed: project.revisionsAllowed,
            revisionsLeft: project.revisionsLeft,
            startDate: project.startDate
        }));

        res.status(200).json(formattedProjects);
    } catch (error) {
        console.error('Error fetching client projects:', error);
        res.status(500).json({ error: "Server error" });
    }
};



// ----------------------------------------------------------------------------
export const createProject = async (req, res) => {
    try {
        const { sourceType, taskId, clientId, freelancerId, amount } = req.body;
        
        let task;
        if (sourceType === 'open') {
            task = await OpenTask.findById(taskId);
        } else {
            task = await PrivateTask.findById(taskId);
        }

        const project = new Project({
            clientId,
            freelancerId,
            title: task.projTitle,
            description: task.description,
            category: task.category,
            references: task.references,
            samples: task.samples,
            dueDate: task.deadline,
            revisionsAllowed: task.revisionsAllowed,
            amount,
            paymentMethod: task.paymentMethod,
            status: 'Pending',
            ...(sourceType === 'open' ? 
                { openTaskId: taskId } : 
                { privateTaskId: taskId })
        });

        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: 'Error creating project', error: error.message });
    }
};