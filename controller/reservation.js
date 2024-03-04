const Reservation = require('../models/Reservation');
const {Company , TimeSlot} = require('../models/Company');
const User = require('../models/User')

exports.getReservations = async (req,res,next)=>{
    try{
        let query;
        if(req.user.role == null || !req.user.role){
            return res.status(401).json({success:false,msg:'Please login first before access this route'})
        }
        if(req.user.role !== 'admin'){
            if (req.user.role === 'user') {
            
            query = User.findById(req.user.id).populate({
                path: 'reservation', 
                select: 'timeslot',
                populate: {
                  path: 'timeslot',
                  model: 'TimeSlot',
                  select: 'company date startTime endTime' 
                }
              });
            }
            else if (req.user.role === 'company') {
                query = Company.findById(req.user.id).populate({
                    path: 'timeslot',
                    select: 'date startTime endTime reservation'
                }).select({timeslot : 1 , _id : 0 })
            }
        }else{
            if(req.params.companyId){
                query = Reservation.find({company: req.params.companyId}).populate({
                    path: 'timeslot',
                    select: 'company date startTime endTime'
                });
            }else query = Reservation.find().populate({
                path: 'timeslot',
                select: 'company date startTime endTime'
            });
        }
        const reservations = await query;
        res.status(200).json({
            success:true,
            count: reservations.length,
            data: reservations
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({success:false , msg: "Cannot find Reservation"});
    }
};

exports.getReservation = async(req,res,next) => {
    try{
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'timeslot',
            select: 'company date startTime endTime'
        });
        if(!reservation){
            return res.status(404).json({success:false,msg: `No reservation with the id of ${req.params.id}`});
        }
        if (req.user.role !== 'admin') {
            if (req.user.role === 'company' && reservation.timeslot.company.toString() !== req.user.id)
                return res.status(401).json({success : false , msg : "You are not the owner of the reservation"})
            if (req.user.role === 'user' && reservation.user.toString() !== req.user.id) 
                return res.status(401).json({success : false , msg : "You are not the owner of the reservation"})
        }

        res.status(200).json({
            success:true,
            data: reservation
        });
    } catch (error){
        console.error(error);
        return res.status(500).json({success:false,msg:"Cannot find reservation"});
    }
};

exports.addReservation = async(req,res,next)=>{
    try{

        if (req.user.role === 'admin')
            return res.status(400).json({success : false , msg : "Admin cannot reserve timeslot"})

        req.body.reservation=req.params.timeslotId;
        const timeslot = await TimeSlot.findById(req.params.timeslotId);
        if(!timeslot){
            return res.status(404).json({success:false, message: `No timeslot with the id of ${req.params.timeslotId}`});
        }
        const ThisUser = await  User.findById(req.user.id).populate({
            path: 'reservation',
            select: 'timeslot'
        })
        
        let isReserveThisTimeslot = false

        //Check is this timeslot is reserve by this user or not
        for (let i = 0 ; i < ThisUser.reservation.length ; i++) {
            if (ThisUser.reservation[i].timeslot.toString() === req.params.timeslotId) {
                isReserveThisTimeslot = true
                break
            }
        }

        if (isReserveThisTimeslot)
            return res.status(400).json({success : false , msg : "You are already reserved this timeslot"})
        
        if(timeslot.reservation.length >= timeslot.capacity){
            return res.status(400).json({success:false , msg : "The timeslot have already exceeded its capacity"});
        }
        if(ThisUser.reservation.length >= 3){
            return res.status(400).json({success:false,msg:`The user with ID ${req.user.id} has already made 3 reservation`});
        }
        const reservation = await Reservation.create({
            user : req.user.id,
            timeslot : req.params.timeslotId
        });
        res.status(201).json({
            success:true,
            data: reservation
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({success:false,message:"Cannot create Reservation"});
    }
};

exports.updateReservation = async(req,res,next)=>{
    try{
        let reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({success:false,msg:`No reservation with the id of ${req.params.id}`});
        }
        if(reservation.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,msg: `User ${req.user.id} is not authorized to update this reservation`});
        }

        //
        if(req.body.user && req.body.user.toString() !== reservation.user.toString())
            return res.status(400).json({success : false , msg : "You can not change owner of reservation to other"})
    
        if (req.body.timeslot === reservation.timeslot.toString() || !req.body.timeslot)
            return res.status(200).json({success: true,data: reservation});
    
    
        const ThisUser = await  User.findById(req.user.id).populate({
            path: 'reservation',
            select: 'timeslot'
        })
        
        let isReserveThisTimeslot = false

        //Check is this timeslot is reserve by this user or not
        for (let i = 0 ; i < ThisUser.reservation.length ; i++) {
            if (ThisUser.reservation[i].timeslot.toString() === req.body.timeslot && ThisUser.reservation[i]._id.toString() !== req.params.id) {
                isReserveThisTimeslot = true
                break
            }
        }

        if (isReserveThisTimeslot)
            return res.status(400).json({success : false , msg : "You already reserve this timeslot"})   
        const targetTimeslot = await TimeSlot.findById(req.body.timeslot)

        const nowReserve = targetTimeslot.reservation.length

        if (nowReserve >= targetTimeslot.capacity)
            return res.status(400).json({success : false , msg : "Target timeslot has exceeded it's capacity"})
        
        const removeReservationFromOldTimeslot = await TimeSlot.findByIdAndUpdate(reservation.timeslot , {$pull : {reservation : req.params.id}})
        const addReservationToNewTimeslot = await TimeSlot.findByIdAndUpdate(req.body.timeslot , {"$push" : {"reservation" : req.params.id}})
        //
        
        reservation = await Reservation.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: reservation
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({success:false,msg:"Cannot update Reservation"});
    }
};

exports.deleteReservation = async(req,res,next)=>{
    try{
        const reservation = await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({success:false,msg: `No reservation with the id of ${req.params.id}`});
        }
        
        if(reservation.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to delete this reservation`});
        }

        //Cascade Delete
        const removeReservationFromUser = await User.findByIdAndUpdate(reservation.user , {$pull : {reservation : req.params.id}})

        const removeReservationFromTimeSlot = await TimeSlot.findByIdAndUpdate(reservation.timeslot , {$pull : {reservation : req.params.id}})

        await reservation.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    }catch (error){
        console.error(error);
        return res.status(500).json({success:false,msg:"Cannot delete Reservation"});
    }
};