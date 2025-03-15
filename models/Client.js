import mongoose, { Schema } from "mongoose";

const clientSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    orders:[{type:mongoose.Schema.Types.ObjectId, ref:'Order'}] // orders placed by the client
    // todo : add phone number field and other fields too
});

const clientModel = mongoose.model('Client',clientSchema);

export default clientModel;