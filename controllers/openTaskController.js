// ?for : backend logic to handle, send & store open task submitted by the user
import openTaskModel from "../models/OpenTask.js";

// creates new open task - "New Project" Btn
export const newOpenTask = async (req, res) => {
    try {
        const { account, project, budget, extras } = req.body;

        // Transform the incoming data to match the OpenTask schema
        const newTask = await openTaskModel.create({
            clientName: account.name,
            clientEmail: account.email,
            
            // Project Details
            category: project.category,
            projTitle: project.title,  // Changed from title to projTitle
            description: project.description,
            references: project.references ? [project.references] : [], // Ensure array format
            deadline: new Date(project.deadline),
            revisionsAllowed: parseInt(project.revisions) || 3,

            // Budget & Pricing
            budgetAmount: parseFloat(budget.amount) || 50,

            // Extras
            freelancerNotes: extras.notes || "",
            freelancerQues: extras.questions || ""
        });

        res.json({ status: "ok", message: "Task created successfully", task: newTask });

    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Task creation failed",
            error: error.message // Send only the message to frontend
        });
    }
};

// Fetch all the data from the DB and send to frontend
export const sendOpenTasks = async (req,res)=>{
    try {
        const data = await openTaskModel.find();    // fetches all the records
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error:"Failed to fetch open tasks"})
    }
}