const mongoose = requie('mongoose') ;

const TimeSlotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true , "Please provide date"]
    },
    startTime: {
        type: Time,
        required: [true , "Please provide Start Time"]
    },
    endTime: {
        type: Time,
        required: [true , "Please provide End Time"]
    },
    capacity: {
        type: Number,
        required: [true , "Please provide capacity"]
    },
    participants: {
        type: [{uid:mongoose.Schema.ObjectId}],
        required: [true , "Please provide participants"]
    },
    description: {
        type: String
    }
})