const TimeSlot = require('../models/TimeSlot')

module.exports.DeleteDepTimeSlot = async function (thisTimeSlotArray) {
    while (thisTimeSlotArray.length > 0) {
        const thisTimeSlotId = thisTimeSlotArray[0]
        const removeTimeSlot = await TimeSlot.findByIdAndDelete(thisTimeSlotId)
    }
    return
}
