import PrivateTask from "../models/PrivateTask.js";
import Project from "../models/projects.js";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const createPrivateOrder = async (req, res) => {
  try {
    const {
      clientId, freelancerId, projTitle, description,
      category, deadline, budgetAmount, paymentMethod,
      revisionsAllowed, freelancerNotes, freelancerQues, references
    } = req.body;

    const requiredFields = [
      'clientId', 'freelancerId', 'projTitle', 'description',
      'category', 'deadline', 'budgetAmount', 'paymentMethod'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId) || !mongoose.Types.ObjectId.isValid(freelancerId)) {
      return res.status(400).json({ message: 'Invalid client or freelancer ID' });
    }

    // Upload files to Cloudinary
    let sampleUrls = [];
    if (req.files?.length) {
      sampleUrls = await Promise.all(
        req.files.map(file =>
          new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { resource_type: 'auto', folder: 'workforce/private-samples' },
              (error, result) => error ? reject(error) : resolve(result.secure_url)
            ).end(file.buffer);
          })
        )
      );
    }

    const privateTask = await PrivateTask.create({
      clientId,
      freelancerId,
      category,
      projTitle,
      description,
      references: Array.isArray(references)
        ? references
        : references?.split(',').map(ref => ref.trim()) || [],
      samples: sampleUrls,
      deadline: new Date(deadline),
      revisionsAllowed: Number(revisionsAllowed) || 3,
      budgetAmount: Number(budgetAmount),
      paymentMethod,
      freelancerNotes: freelancerNotes || "",
      freelancerQues: freelancerQues || ""
    });

    const project = await Project.create({
      clientId,
      freelancerId,
      title: projTitle,
      description,
      category,
      references: privateTask.references,
      samples: privateTask.samples,
      dueDate: privateTask.deadline,
      revisionsAllowed: privateTask.revisionsAllowed,
      amount: privateTask.budgetAmount,
      paymentMethod: privateTask.paymentMethod,
      status: 'Pending'
    });

    res.status(201).json({
      status: 'ok',
      message: 'Private order created successfully',
      task: privateTask,
      project
    });

  } catch (error) {
    console.error('Error creating private order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create private order',
      error: error.message
    });
  }
};

export const getClientPrivateOrders = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const privateOrders = await PrivateTask.find({ clientId }).lean();
    res.status(200).json(privateOrders);
  } catch (error) {
    console.error('Error fetching private orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
