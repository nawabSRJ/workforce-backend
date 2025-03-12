import mongoose, { mongo } from "mongoose";

const reminderSchema = new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    phone:{type:String,required:true},
    title:{type:String,required:true},
    message:{type:String},
    sendAt: { type: Date, required: true },
    send:{type:Boolean, required:true, default:false}
})

const reminderModel = mongoose.model('Reminders',reminderSchema);

export default reminderModel;