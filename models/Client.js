import mongoose, { Schema } from "mongoose";

const clientSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    order:[{type:mongoose.Schema.Types.ObjectId, ref:'Order'}] // orders placed by the client
    
});

const clientModel = mongoose.model('Client',clientSchema);

export default clientModel;