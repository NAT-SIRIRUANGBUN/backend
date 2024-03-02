const Company = require('../models/Company')

module.exports.AddTimeSlotToCompany = async function(thisCompanyId , thisTimeSlotId) {
    const updateCompanyTimeslotList = await Company.findByIdAndUpdate(thisCompanyId , {"$push" : {"timeslot" : thisTimeSlotId}})
    return
}

