const mongoose = require('mongoose') ;
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const CompanySchema = new mongoose.Schema({
    name: {
        type: String ,
        unique: true ,
        trim: true ,
        maxlength: [255 , "Name can not be more then 255 characters"]
    },
    address: {
        type: String ,
        required: [true , "Please provide an address"]
    },
    website: {
        type: String 
    },
    description: {
        type: String ,
        required: [true , "Please provide a description"]
    },
    tel: {
        type: String ,
        required: [true , "Please provide telephone number"],
        match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im]
    },
    contact_email: {
        type: String ,
        required:[true,'Please provide a contact_email'],
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ , 'Please add a valid email']
    },
    login_email: {
        type: String ,
        required:[true,'Please provide a login_email'],
        unique: true,
        select: false,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ , 'Please add a valid email']
    },
    password: {
        type: String ,
        required: [true , "Please provide a password"] ,
        minlength: 6 ,
        select: false,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        createdAt:{
            type: Date,
            default:Date.now
        }
    },
    size: {
        type: String ,
        enum: ['S' , 'M' , 'L']
    },
    timeslot: {
        type: [{tid:mongoose.Schema.ObjectId}]
    }
});

//Encrypt password using bcrypt
CompanySchema.pre('save',async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

//Sign JWT and return
CompanySchema.methods.getSignedJwtToken=function(){
    return jwt.sign({id:this._id , type:'Company'} , process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
}

//Match user entered password to hashed password in database
CompanySchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword , this.password) ;
}

module.exports=mongoose.model('Company',CompanySchema);