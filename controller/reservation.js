const Reservation = require('../models/Reservation');
const Company = require('../models/Company')

exports.getReservations = async (req,res,next)=>{
    let query;
    if(req.user.role !== 'admin'){
        query = Reservation.find({user:req.user.id}).populate({
            path: 'company',
            select: 'name address tel contact_email'
        });
    }else{
        if(req.params.companyId){
            query = Reservation.find({company: req.params.companyId}).populate({
                path: "company",
                select: "name address tel contact_email"
            });
        }else query = Reservation.find().populate({
            path: 'company',
            select: 'name address tel contact_email'
        });
    }

    try{
        const reservations = await query;
        res.status(200).json({
            success:true,
            count: reservations.length,
            data: reservations
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false , message: "Cannot find Reservation"});
    }
};

exports.getReservation = async(req,res,next) => {
    try{
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'company',
            select: 'name address tel contact_email'
        });

        if(!reservation){
            return res.status(404).json({success:false,message: `No reservation with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success:true,
            data: reservation
        });
    } catch (error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot find reservation"});
    }
};

exports.addReservation = async(req,res,next)=>{
    try{
        req.body.reservation=req.params.companyId;
        const company = await Company.findById(req.params.companyId);
        if(!company){
            return res.status(404).json({success:false, message: `No company with the id of ${req.params.companyId}`});
        }
        req.body.user=req.user.id;
        const existedReservation = await Reservation.find({user:req.user.id});
        if(existedReservation.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 reservation`});
        }
        const reservation = await Reservation.create(req.body);
        res.status(200).json({
            success:true,
            data: reservation
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot create Reservation"});
    }
};

exports.updateReservation = async(req,res,next)=>{
    try{
        let reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({success:false,message:`No reservation with the id of ${req.params.id}`});
        }
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message: `User ${req.user.id} is not authorized to update this reservation`});
        }
        reservation = await Reservation.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: reservation
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update Reservation"});
    }
};

exports.deleteReservation = async(req,res,next)=>{
    try{
        const reservation = await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({success:false,message: `No reservation with the id of ${req.params.id}`});
        }
        
        if(reservation.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this reservation`});
        }

        await reservation.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    }catch (error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete Reservation"});
    }
};