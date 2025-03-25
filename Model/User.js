import { create } from "domain";
import mongoose from "mongoose";
import { type } from "os";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImg:{
        type: String,   
    },
    createdAt: {
        type: Date,
        default: Date.now,  
    },
});

export const User = mongoose.model("Authenticate",userSchema);