// code to send the data of freelancers
// ? this is written for the feature or explore page on frontend

import freelancerModel from "../models/freelancer.js"

export const sendFreelancersData = async (req,res) =>{
    try {
        const data = await freelancerModel.find(); // fetches all
        res.status(200).json(data);
    } catch (error) {
        console.log('error fetching freelancers : ',error)
    }
}