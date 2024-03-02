const Timeslot = require('../models/TimeSlot')

exports.getTimeslot = async (req , res , next) => {
    try {
        const timeslot = await Timeslot.find()
        res.status(200).json({success : true , timeslot})
    }
    catch(err) {
        console.error(err)
        res.status(400).json({success : false , msg : "Something Wrong"})
    }
}