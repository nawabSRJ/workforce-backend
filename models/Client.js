import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    gender:{type:String,required:true},
    orders:[{type:mongoose.Schema.Types.ObjectId, ref:'Order'}], // orders placed by the client
    phone:{type:String,required:true, unique:true},
    projectsPosted:{type:Number,default:0},
    projectsCompleted:{type:Number,default:0},
    totalExpense:{type:Number,default:0},
    // 
});

const clientModel = mongoose.model('Client',clientSchema);

export default clientModel;