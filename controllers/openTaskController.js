// ?for : backend logic to handle, send & store open task submitted by the user
import openTaskModel from "../models/OpenTask.js";

// creates new open task - "New Project" Btn
export const newOpenTask = async (req, res) => {
    try {
        const {
            account, 
            project, 
            budget, 
            extras
        } = req.body;

        const newTask = await openTaskModel.create({
            clientName: account.name,
            clientEmail: account.email,
            
            // Project Details
            category: project.category,
            title: project.title,
            description: project.description,
            references: project.references, // Array of links
            deadline: project.deadline,
            revisionsAllowed: project.revisions,

            // Budget & Pricing
            budgetAmount: budget.amount,

            // Extras (optional fields)
            freelancerNotes: extras.notes,
            freelancerQues: extras.questions
        });

        res.json({ status: "ok", message: "Task created successfully", task: newTask });

    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ status: "error", message: "Task creation failed", error });
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