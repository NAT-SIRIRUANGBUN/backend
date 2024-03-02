const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        required: [true , "Please provide user id"]
    },
    timeslot: {
        type: mongoose.Schema.ObjectId,
        required: [true, "Please provide timeslot id"]
    }
})

module.exports = mongoose.model('Reservation',ReservationSchema);