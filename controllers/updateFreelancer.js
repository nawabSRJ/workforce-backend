import Freelancer from '../models/freelancer.js';
import mongoose from 'mongoose';

export const updateFreelancerProfile = async (req, res) => {
  try {
    const { freelancerUsername } = req.params;
    const { 
      name, 
      bio, 
      tags, 
      portfolioWebsite, 
      linkedIn, 
      twitter, 
      phone 
    } = req.body;
    
    // Validate username
    if (!freelancerUsername) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    // Validate required inputs
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Validate tags is an array
    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be an array' });
    }

    // Check if freelancer exists
    const freelancer = await Freelancer.findOne({ username: freelancerUsername });
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    
    // Validate phone if provided
    if (phone) {
      if (!phone.code) {
        return res.status(400).json({ message: 'Phone country code is required' });
      }
      
      if (!phone.number) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      
      // If phone number is different, check if it's already in use
      if (phone.number !== freelancer.phone?.number) {
        const existingFreelancer = await Freelancer.findOne({ 'phone.number': phone.number });
        if (existingFreelancer && existingFreelancer.username !== freelancerUsername) {
          return res.status(409).json({ message: 'Phone number already in use' });
        }
      }
    }
    
    // Prepare update object with only the fields that are present in the request
    const updateFields = {};
    
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (tags) updateFields.tags = tags;
    if (portfolioWebsite !== undefined) updateFields.portfolioWebsite = portfolioWebsite;
    if (linkedIn !== undefined) updateFields.linkedIn = linkedIn;
    if (twitter !== undefined) updateFields.twitter = twitter;
    if (phone) updateFields.phone = phone;
    
    // Add updatedAt timestamp
    updateFields.updatedAt = new Date();
    
    // Update freelancer profile
    const updatedFreelancer = await Freelancer.findOneAndUpdate(
      { username: freelancerUsername },
      updateFields,
      { new: true, runValidators: true }
    ).select('-password'); // Exclude sensitive data
    
    if (!updatedFreelancer) {
      return res.status(404).json({ message: 'Failed to update freelancer profile' });
    }
    
    // Return updated freelancer data
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedFreelancer
    });
    
  } catch (error) {
    console.error('Error updating freelancer profile:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        message: 'Validation error',
        errors: messages 
      });
    }
    
    return res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};