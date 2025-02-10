import express from "express";
import jwt from "jsonwebtoken";
import cors from 'cors'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import mongodbURL from "./config.js";
import clientModel from './models/client.js';



const port = process.env.port || 8000;
const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    methods: ["POST", "GET"],
    credentials: true
}));

mongoose.connect(`${mongodbURL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const verifyUser = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.json({message:"Token Please"});
    }else{
        jwt.verify(token, "our-token-key" , (err,decoded)=>{
            if(err){
                return res.json({message:"Auth Error"});
            }else{
                req.email = decoded.email;
                next(); 
            }
        })
    }
}

// default route pe direct login if token found
app.get('/', verifyUser, (req, res) => {
    return res.json({ status: "Success", email: req.email });
});
  

// login
app.post('/client-login',(req,res,next)=>{
    const {email,password} = req.body;
    clientModel.findOne({email:email}) // key name : variable (destructured)
    .then(client=>{
        if(client){
            if(client.password === password){
                // grant token
                const token = jwt.sign({email}, "our-token-key",{expiresIn:'1d'});
                res.cookie('token',token);
                return res.status(200).json({message:"Success"});
            }
            else{
                // wrong password
                res.status(401).json("Incorrect Password");
            }
        }else{
            // No such client
            return res.json({message:"Not Found"})
        }
    }).catch(err =>{
        return res.json(err);
    })
})

// logout
app.post('/client-logout', (req,res,next)=>{
    res.clearCookie('token');
    return res.json({status:"Success", message:"Logged Out"})
})

// sign-up ?
app.post('/client-signup', (req,res,next)=>{
    // create new user = new mongodb client model
    clientModel.create(req.body)
    .then(clients=>res.json(clients))
    .catch(err => res.json(err));
})



app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);    
})