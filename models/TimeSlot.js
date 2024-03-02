const mongoose = require('mongoose') ;
const Company = require('./Company')

const TimeSlotSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: [true , "Please provide company id"]
    },
    date: {
        type: Date,
        required: [true , "Please provide date"]
    },
    startTime: {
        type: String,
        required: [true , "Please provide Start Time"]
    },
    endTime: {
        type: String,
        required: [true , "Please provide End Time"]
    },
    capacity: {
        type: Number,
        required: [true , "Please provide capacity"]
    },
    reservation: {
        type: [{type:mongoose.Schema.ObjectId}]
    },
    description: {
        type: String
    }
}   
);

TimeSlotSchema.pre('save' , async function (next) {
    try{
        const updateCompanyTimeslotList = await Company.findByIdAndUpdate(this.company , {"$push" : {"timeslot" : this.id}})
    }catch(error){
        console.error(err);
    }
})

module.exports=mongoose.model('Timeslot',TimeSlotSchema);