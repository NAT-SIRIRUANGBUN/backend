const Reservation = require('../models/Reservation');
const Company = require('../models/Company')

exports.getAllReservation = async (req,res,next)=>{
    let query;
    if(req.user.role !== 'admin'){
        query = Reservation.find({user:req.user.id}).populate({
            path: 'company',
            select: 'name address tel'
        });
    }else{
        if(req.params.companyId){
            console.log(req.params.companyId);
            query = Reservation.find({company: req.params.companyId}).populate({
                path: "company",
                select: "name address tel"
            });
        }else query = Reservation.find().populate({
            path: 'company',
            select: 'name address tel'
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