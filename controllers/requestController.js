import express from "express";
import Message from '../models/messageModel.js';
import Freelancer from '../models/freelancer.js';

export const requestHandler = async(req,res)=>{
    const { clientId } = req.params;
    try {
      const requests = await Message.find({
        receiverId: clientId,
        type: 'request'
      }).sort({ timestamp: -1 });
  
      const populatedRequests = await Promise.all(
        requests.map(async (req) => {
          const freelancer = await Freelancer.findById(req.senderId).select('name email');
          return {
            ...req._doc,
            freelancer
          };
        })
      );
  
      res.json(populatedRequests);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
}