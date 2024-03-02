const Company = require('../models/Company');

//@DESC Get all companys
//@route GET /api/v1/companies
//@access Public
exports.getCompanies = async (req,res,next) => {
    try {
        const companies = await Company.find() ;

        res.status(200).json({success: true, count: companies.length , data: companies});
    } catch(err){
        console.error(err);
        res.status(400).json({success: false});
    }
    
};

//@DESC Get single company
//@route GET /api/v1/companys/:id
//@access Public
exports.getCompany = async (req,res,next) => {
    try {
        const company = await Company.findById(req.params.id);

        if(!company){
            return res.status(400).json({success: false});
        }

        res.status(200).json({success: true, data: company});
    } catch (err) {
        res.status(400).json({success: false});
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
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true ,
            runValidators: true
        });

        if(!company){
            res.status(400).json({success: false});
        }

        res.status(200).json({success:true, data: company});
    } catch (err) {
        res.status(400).json({success: false});
    }
};

//@DESC Delete company
//@route DELETE /api/v1/companys/:id
//@access Private
exports.deleteCompany = async (req,res,next) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);

        if(!company) {
            return res.status(400).json({success:false});
        }

        res.status(200).json({success: true , data: {}});
    } catch (err) {
            res.status(400).json({success: false});
    }
};

exports.getTimeSlot = async (req , res , next) => {
    try {
        const thisCompany = await Company.findById(req.params.id)

        if (!thisCompany)
            return res.status(404).json({success : false , msg : "Can not find company with id : " + req.params.id})
        
        const timeslot = thisCompany.timeslot
        
        res.status(200).json({success : true , timeslot})
    }
    catch(err) {
        console.error(err)
        res.statis(400).json({msg : "Something Wrong"})
    }
}