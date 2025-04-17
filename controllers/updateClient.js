import Client from '../models/Client.js';
import mongoose from 'mongoose';

export const updateClientProfile = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { name, email, gender, phone } = req.body;
    
    // Validate client ID
    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }
    
    // Validate inputs
    if (!name || !email || !gender || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone must be 10 digits' });
    }

    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    // Check if email is already taken by another client
    if (email !== client.email) {
      const existingClient = await Client.findOne({ email });
      if (existingClient) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }
    
    // Check if phone is already taken by another client
    if (phone !== client.phone) {
      const existingClient = await Client.findOne({ phone });
      if (existingClient) {
        return res.status(409).json({ message: 'Phone number already in use' });
      }
    }
    
    // Update client profile
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { name, email, gender, phone },
      { new: true, runValidators: true }
    ).select('-password -orders');
    
    // Return updated client data
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedClient
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    
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