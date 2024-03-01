const mongoose = require('mongoose') ;

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
        required: [true , "Please provide telephone number"]
    },
    email: {
        type: String ,
        required:[true,'Please provide an email'],
        unique: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ , 'Please add a valid email']
    },
    password: {
        type: String ,
        required: [true , "Please provide a password"] ,
        minlength: 6 ,
        select: false
    },
    size: {
        type: String ,
        enum: ['S' , 'M' , 'L']
    },
    timeslot: {
        type: [{tid:mongoose.Schema.ObjectId}]
    }
});

module.exports=mongoose.model('Company',CompanySchema);