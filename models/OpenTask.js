import mongoose from "mongoose";

const OpenTaskSchema = new mongoose.Schema({
    clientName:{type:String, required:true},
    clientEmail:{type:String,required:true},

     // Project Details
     category: { type: String, required: true },
     projTitle: { type: String, required: true },
     description: { type: String, required: true },
     references: [{ type: String }],  // Array of strings for multiple links
     deadline: { type: Date, required: true },
     revisionsAllowed: { type: Number, required: true },

    //  budget & pricing
     budgetAmount:{type:Number,required:true,default:50}, // minimum 50 INR 

    //  extras
     freelancerNotes:{type:String,default:""},
     freelancerQues:{type:String,default:""},
})

const openTaskModel = mongoose.model('OpenTask',OpenTaskSchema);
export default openTaskModel;