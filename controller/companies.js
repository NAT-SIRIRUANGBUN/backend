const Company = require('../models/Company');

//@DESC Get all companys
//@route GET /api/v1/companies
//@access Public
exports.getCompanies = async (req,res,next) => {

    let query;

    const reqQuery={...req.query};

    const removeFields=['select','sort','page','limit'];

    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

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