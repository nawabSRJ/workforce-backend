import openTaskModel from "../models/OpenTask.js";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ? create new open task
export const newOpenTask = async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = [
            'clientName', 'clientEmail',
            'projTitle', 'description', 'category',
            'deadline', 'budgetAmount', 'paymentMethod'
        ];
        
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    status: "error",
                    message: `Missing required field: ${field}`
                });
            }
        }

        // Validate date format
        const deadlineDate = new Date(req.body.deadline);
        if (isNaN(deadlineDate.getTime())) {
            return res.status(400).json({
                status: "error",
                message: "Invalid deadline date format"
            });
        }

        // Upload files to Cloudinary
        let sampleUrls = [];
        if (req.files && req.files.length > 0) {
            sampleUrls = await Promise.all(req.files.map(file => 
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { resource_type: 'auto', folder: 'workforce/samples' },
                        (error, result) => error ? reject(error) : resolve(result.secure_url)
                    ).end(file.buffer);
                })
            ));
        }

        // Create new task
        const newTask = await openTaskModel.create({
            clientName: req.body.clientName,
            clientEmail: req.body.clientEmail,
            category: req.body.category,
            projTitle: req.body.projTitle,
            description: req.body.description,
            references: req.body.references ? [req.body.references] : [],
            samples: sampleUrls,
            deadline: deadlineDate,
            revisionsAllowed: parseInt(req.body.revisionsAllowed) || 3,
            budgetAmount: parseFloat(req.body.budgetAmount) || 50,
            paymentMethod: req.body.paymentMethod,
            freelancerNotes: req.body.freelancerNotes || "",
            freelancerQues: req.body.freelancerQues || "",
            status: 'Open'
        });

        res.json({ 
            status: "ok", 
            message: "Task created successfully", 
            task: newTask 
        });

    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Task creation failed",
            error: error.message 
        });
    }
};

// ? for sending open tasks to the frontend
export const sendOpenTasks = async (req,res)=>{
    try {
        const data = await openTaskModel.find();    // fetches all the records
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error:"Failed to fetch open tasks"})
    }
}


// ? for updating the application count after a freelancer successfully request using message

export const applyForTask = async(req,res)=>{
    try {
        const {taskId} = req.params;
        if(!mongoose.Types.ObjectId.isValid(taskId)){
            return res.status(400).json({message:'Invalid Task Id'});
        }

        const updatedTask = await openTaskModel.findByIdAndUpdate(
            taskId,
            {$inc : {applicationsCount:1}},
            {new:true} // ? why this line?
        )

        if(!updatedTask){
            return res.status(404).json({ message: "Open task not found" });
        }

        res.status(200).json({
            message: "Application count incremented successfully",
            task: updatedTask
          });
    } catch (error) {
        console.error("Error updating applications count:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// ? for updating the staus of the open task
export const updateTaskStatus = async(req,res)=>{
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        
        if (!status || !['Open', 'In Discussion', 'Accepted', 'Closed'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status provided'
          });
        }
        
        const updatedTask = await openTaskModel.findByIdAndUpdate(
          taskId,
          { status },
          { new: true }
        );
        
        if (!updatedTask) {
          return res.status(404).json({
            success: false,
            message: 'Open task not found'
          });
        }
        
        return res.status(200).json({
          success: true,
          task: updatedTask
        });
      } catch (error) {
        console.error('Error updating open task status:', error);
        return res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
      }
}