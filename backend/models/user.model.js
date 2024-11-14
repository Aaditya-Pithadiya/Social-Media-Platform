import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    profilePicture:{type:String,default:''},
    bio:{type:String, default:''},
    gender:{type:String,enum:['male','female']},
    isVerified:{type:Boolean,default:false},
    verificationCode:{type:String},
    verificationExpires: {type: Date, default: Date.now, index: {expireAfterSeconds: 0}},

    followers:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    following:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    
    posts:[{type:mongoose.Schema.Types.ObjectId, ref:'Post'}],
    bookmarks:[{type:mongoose.Schema.Types.ObjectId, ref:'Post'}]
},{timestamps:true});

userSchema.pre('save', function(next) {
    if (!this.isVerified) {
        this.verificationExpires = new Date(Date.now() + 60*1000);
    } else {
        this.verificationExpires = null;
    }
    next();
});

export const User = mongoose.model('User', userSchema);