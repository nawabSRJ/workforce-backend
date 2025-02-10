import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String,required :true},
    price:{type:Number,required:true},
    deliveryTime:{type:Number,required:true},
    freelancerId:{type:mongoose.Schema.Types.ObjectId, ref:'Freelancer', required:true}, // linked freelancer
    images:[{type:String}], // URLs for service images
    reviews:[
        {
            clientId:{type:mongoose.Schema.Types.ObjectId, ref:'Client'},
            rating:{type:Number},
            comment:{type:String},
        },
    ] // client feedback
});

const serviceModel = mongoose.model('Service', serviceSchema);

export default serviceModel;