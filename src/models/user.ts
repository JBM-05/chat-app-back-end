import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    }
    ,name:{
        type: String,
        required: true,
        trim: true,
    }
    ,password:{
        type: String,
        required: true,
        trim: true,
        minlenghth: 6,
        select: false, 
        maxlength:100
    },
    profilePic:{
        type: String,
        default:"",
    }},
    {timestamps: true}
)
const User =mongoose.model("User", userSchema);
export default User;