import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true, unique:true},
    password:{type:String,required:true},
    gender:{type:String,required:true},
    username:{type:String,required:true , unique:true},
    phone:{type:String,required:true, unique:true},
    tags:[{type:String,required:true}], // List
    rating:{type:Number,default:0}, // avg. rating
    services:[{type:mongoose.Schema.Types.ObjectId, ref:'Service'}], // services offered by the freelancer
    createdAt:{type:Date, default:Date.now},
    totalEarnings:{type:Number,default:0},
    completedProjects:{type:Number,default:0},
})

const freelancerModel = mongoose.model('Freelancer',freelancerSchema);

export default freelancerModel;