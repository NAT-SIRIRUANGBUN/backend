const mongoose = require('mongoose') ;

const TimeSlotSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.ObjectId,
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
    participants: {
        type: [{uid:mongoose.Schema.ObjectId}],
    },
    description: {
        type: String
    }
})

module.exports=mongoose.model('Timeslot',TimeSlotSchema);