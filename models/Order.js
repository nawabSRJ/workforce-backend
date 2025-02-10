import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    clientId : {type:mongoose.Schema.Types.ObjectId , ref:'Client', required:true},
    freelancerId:{type:mongoose.Schema.Types.ObjectId, ref:'Freelancer', required:true},
    serviceId:{type:mongoose.Schema.Types.ObjectId, ref:'Service', required:true},
    status:{
        type:String,
        enum:['pending','in-progress','completed','cancelled'],
        default:'pending'    
    }, // for order status (frontend)
    price:{type:Number, require:true},
    deliveryDate:{type:Date}, // deadline
});

const orderModel = mongoose.model('Order', orderSchema);

export default orderModel;