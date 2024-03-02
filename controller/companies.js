const {Company , TimeSlot} = require('../models/Company');
const Reservation = require('../models/Reservation');
const User = require('../models/User')
//@DESC Get all companys
//@route GET /api/v1/companies
//@access Public
exports.getCompanies = async (req,res,next) => {

    let query;

    const reqQuery={...req.query};

    const removeFields=['select','sort','page','limit'];

    removeFields.forEach(param=>delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=> `$${match}`);
    query = Company.find(JSON.parse(queryStr));

    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('name');
    }

    const page = parseInt(req.query.page,10)||1;
    const limit = parseInt(req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex = page*limit;
    
    try{
        const total = await Company.countDocuments();
        query = query.skip(startIndex).limit(limit);
        const companies = await query;
        const pagination={};
        if(endIndex < total){
            pagination.next={
                page:page+1,
                limit
            }
        }
        if(startIndex > 0){
            pagination.prev={
                page:page-1,
                limit
            }
        }
        res.status(200).json({success:true, count:companies.length, data:companies});
    }catch(err){
        console.error(err);
        res.status(400).json({success:false});
    }
    
};

//@DESC Get single company
//@route GET /api/v1/companys/:id
//@access Public
exports.getCompany = async (req,res,next) => {
    try {
        const company = await Company.findById(req.params.id);

        if(!company){
            return res.status(404).json({success: false , msg : "Can not find company with id : " + req.params.id});
        }

        res.status(200).json({success: true, data: company});
    } catch (err) {
        console.error(error);
        res.status(400).json({success: false , msg : "Something Wrong"});
    }
};

//@DESC Create new company
//@route GET /api/v1/companys
//@access Private
exports.createCompany = async (req,res,next) => {
    try {
        const company = await Company.create(req.body) ;
        res.status(201).json({
            success: true,
            data: company
        });
    }
    catch(err) {
        console.error(err)
        res.status(400).json({success : false , msg : "Please recheck your detail before submit"})
    }
    
};

//@DESC Update company
//@route PUT /api/v1/companys/:id
//@access Private
exports.updateCompany = async (req,res,next) => {
    try {

        const thisCompany = await Company.findById(req.params.id)

        if (!thisCompany)
            return res.status(404).json({success : false , msg : "Can not find company with id : " + req.params.id})

        if (req.params.id !== req.user.id) 
            return res.status(401).json({success : false , msg : "Please use correct company account to update this company info"})

        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true ,
            runValidators: true
        });

        res.status(200).json({success:true, data: company});
    } catch (err) {
        console.error(error);
        res.status(400).json({success: false , msg : "Something Wrong"});
    }
};

//@DESC Delete company
//@route DELETE /api/v1/companys/:id
//@access Private
exports.deleteCompany = async (req,res,next) => {
    try {

        const thisCompany = await Company.findById(req.params.id)

        if (!thisCompany)
            return res.status(404).json({success : false , msg : "Can not find company with id : " + req.params.id})

        if (req.params.id !== req.user.id) 
            return res.status(401).json({success : false , msg : "Please use correct company account to update this company info"})


        //Cascade delete time slot
        for (let i = 0 ; i < thisCompany.timeslot.length ; i++) {
            await cascadeDeleteTimeSlot(thisCompany.timeslot[i])
        }

        await thisCompany.deleteOne()

        res.status(200).json({success: true , data: {}});

    } catch (err) {
        console.error(err);
        res.status(400).json({success: false , msg : "Something Wrong"});
    }
};

exports.getCompanyTimeSlot = async (req , res , next) => {
    try {
        const thisCompany = await Company.findById(req.params.id)

        if (!thisCompany)
            res.status(404).json({success : false , msg : "Can not find company with id : " + req.params.id})
        
        const timeslot = thisCompany.timeslot

        res.status(200).json({success : true , timeslot})
    }
    catch(err) {
        console.error(err)
        res.status(400).json({msg : "Something Wrong"})
    }
}

exports.createTimeslot = async (req , res , next) => {
    try {

        const thisCompany = await Company.findById(req.user.id)

        if (!thisCompany)
            return res.status(404).json({success : false , msg : "Can not find company with id : " + req.user.id})
            
        if (req.params.id !== req.user.id) 
            return res.status(401).json({success : false , msg : "Please use correct company account to create this time slot"})
        
        req.body.company = req.user.id
        const newTimeslot = await TimeSlot.create(req.body)
        
        res.status(200).json({success : true , timeslot : newTimeslot})
    }
    catch(err) {
        console.error(err)
        res.status(400).json({success : false , msg : "Something Wrong"})
    }
}

exports.updateTimeslot = async (req , res , next) => {
    try {

        const thisCompany = await Company.findById(req.user.id)

        if (!thisCompany)
            return res.status(404).json({success : false , msg : "Can not find company with id : " + req.user.id})

        if (req.params.id !== req.user.id) 
            return res.status(401).json({success : false , msg : "Please use correct company account to update this timeslot"})
        
        const thisTimeslot = await TimeSlot.findById(req.params.timeslotid)

        if (!thisTimeslot)
            return res.status(404).json({success : false , msg : "Can not find timeslot with id : " + req.params.timeslotid})

        req.body.company = req.user.id

        const updateTimeslot = await TimeSlot.findByIdAndUpdate(req.params.timeslotid , req.body , {new : true , runValidators : true})

        res.status(200).json({success : true , timeslot : updateTimeslot})
    }
    catch(err) {
        console.error(err)
        res.status(400).json({success : false , msg : "Something Wrong"})
    }
}

exports.deleteTimeslot = async (req , res , next) => {
    try {

        const thisCompany = await Company.findById(req.params.id)

        if (!thisCompany)
            return res.status(404).json({success : false , msg : "Can not find company with id : " + req.params.id})

        if (req.params.id !== req.user.id)
            return res.status(401).json({success : false , msg : "Please use correct company account to delete this time slot"})
    
        const thisTimeslot = await TimeSlot.findById(req.params.timeslotid)
    
        if (!thisTimeslot)
            return res.status(404).json({success : false , msg : "Can not find timeslot with id : " + req.params.timeslotid})

        // const deleteTimeslot = await (await TimeSlot.findById(req.params.timeslotid)).deleteOne()
        cascadeDeleteTimeSlot(req.params.timeslotid)

        res.status(200).json({success : true , timeslot : {}})
    }
    catch(err) {
        console.error(err)
        res.status(400).json({success : false , msg : "Something Wrong"})
    }
}

async function cascadeDeleteTimeSlot(timeSlotId) {
    const thisTimeSlot = await TimeSlot.findById(timeSlotId)

    let reservationList = thisTimeSlot.reservation

    for (let i = 0 ; i < reservationList.length ; i++) {
        let thisReservationId = reservationList[i]

        let thisReservation = await Reservation.findById(thisReservationId)

        let thisUserId = thisReservation.user
        
        const removeReservationFromUser = await User.findByIdAndUpdate(thisUserId , {$pull : {reservation : thisReservationId}})
        const deleteThisReservation = await thisReservation.deleteOne()
    }

    await thisTimeSlot.deleteOne()
}