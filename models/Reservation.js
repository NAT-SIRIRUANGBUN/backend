const mongoose = require('mongoose');
const {TimeSlot} = require('./Company');
const User = require('./User');
const Reservastion = require('./Reservation')

const ReservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true , "Please provide user id"]
    },
    timeslot: {
        type: mongoose.Schema.ObjectId,
        ref: 'Timeslot',
        required: [true, "Please provide timeslot id"]
    }
})

ReservationSchema.pre('save' , async function (next) {
    try{
        const updateTimeslot = await TimeSlot.findByIdAndUpdate(this.timeslot , {"$push" : {"reservation" : this.id}})
        const updateUser = await User.findByIdAndUpdate(this.user , {"$push" : {"reservation" : this.id}})
    }catch(err){
        console.error(err);
    }
})

module.exports = mongoose.model('Reservation',ReservationSchema);