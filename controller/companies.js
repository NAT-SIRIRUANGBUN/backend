const {Company , TimeSlot} = require('../models/Company');
const Reservation = require('../models/Reservation');
const User = require('../models/User')
const mongoose = require('mongoose')
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
        console.error(err);
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
        console.error(err);
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

        await cascadeDeleteTimeSlot(thisCompany.timeslot)

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
            return res.status(404).json({success : false , msg : "Can not find company with id : " + req.params.id})
        
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

        const thisCompany = await Company.findById(req.params.id)

        if (!thisCompany)
            return res.status(404).json({success : false , msg : "Can not find company with id : " + req.params.id})
            
        if (req.params.id !== req.user.id && req.user.role !== 'admin') 
            return res.status(401).json({success : false , msg : "Please use correct company account to create this time slot"})
        
        req.body.company = req.params.id

        const newTimeslot = await TimeSlot.create(req.body)
        
        res.status(201).json({success : true , timeslot : newTimeslot})
    }
    catch(err) {
        console.error(err)
        res.status(400).json({success : false , msg : "Something Wrong"})
    }
}

exports.updateTimeslot = async (req , res , next) => {
    try {

        const thisCompany = await Company.findById(req.params.id)

        if (!thisCompany)
            return res.status(404).json({success : false , msg : "Can not find company with id : " + req.params.id})

        const thisTimeslot = await TimeSlot.findById(req.params.timeslotid)

        if (!thisTimeslot)
            return res.status(404).json({success : false , msg : "Can not find timeslot with id : " + req.params.timeslotid})
        
        if (req.params.id !== thisTimeslot.company.toString())
            return res.status(400).json({success : false , msg : "Timeslot id : " + req.params.timeslotid + "is not provided by Company with id :" + req.params.id})

        if (req.params.id !== req.user.id && req.user.role !== 'admin') 
            return res.status(401).json({success : false , msg : "Please use correct company account to update this timeslot"})
        
       
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

        const thisTimeslot = await TimeSlot.findById(req.params.timeslotid)
    
        if (!thisTimeslot)
            return res.status(404).json({success : false , msg : "Can not find timeslot with id : " + req.params.timeslotid})
        
        if (req.params.id !== thisTimeslot.company.toString())
            return res.status(400).json({success : false , msg : "Timeslot id : " + req.params.timeslotid + "is not provided by Company with id :" + req.params.id})

        if (req.params.id !== req.user.id && req.user.role !== 'admin')
            return res.status(401).json({success : false , msg : "Please use correct company account to delete this time slot"})
    

        cascadeDeleteTimeSlot(new mongoose.Types.ObjectId(req.params.timeslotid))

        res.status(200).json({success : true , timeslot : {}})
    }
    catch(err) {
        console.error(err)
        res.status(400).json({success : false , msg : "Something Wrong"})
    }
}

async function cascadeDeleteTimeSlot(timeSlotIdList) {

    const tmp = await TimeSlot.find({_id : {$in : timeSlotIdList}})

    const thisReservationNotClean = (await TimeSlot.find({_id : {$in : timeSlotIdList}}).select({reservation : 1 , _id : 0})).map(x => x.reservation)

    const reservationIdList = []

    for (let i = 0 ;  i < thisReservationNotClean.length ; i++) {
        for (let j = 0 ; j < thisReservationNotClean[i].length ; j++)
            reservationIdList.push(thisReservationNotClean[i][j])
    }

    const allUserIdUnclean = (await Reservation.find({_id : {$in : reservationIdList}}).select({_id : 0 , user : 1})).map(x => x.user)
    let dict = {}
    let allUserId = []

    for (let i = 0 ; i < allUserIdUnclean.length ; i++) {
        if (!dict[allUserIdUnclean[i]]) {
            allUserId.push(allUserIdUnclean[i])
            dict[allUserIdUnclean[i]] = true
        }
    }

    const removeReservationFromUser = await User.updateMany({_id : {$in : allUserId}} , {$pull : {reservation : {$in : reservationIdList}}})
    const RemoveReservation = await Reservation.deleteMany({_id : {$in : reservationIdList}})
    
    await TimeSlot.deleteMany({_id : {$in : timeSlotIdList}})
}

exports.getCompanyDetail = async (req , res , next) => {
    const thisCompany = await Company.findById(req.user.id)
    res.status(200).json({success : true , data : thisCompany})
}