const {TimeSlot} = require('../models/Company')

exports.getTimeslots = async (req , res , next) => {
    let query;

    const reqQuery={...req.query};

    const removeFields=['select','sort','page','limit'];

    removeFields.forEach(param=>delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=> `$${match}`);
    query = TimeSlot.find(JSON.parse(queryStr));

    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('date');
    }

    query = query.populate({
        path: 'company',
        select: 'name tel contact_email'
    });

    const page = parseInt(req.query.page,10)||1;
    const limit = parseInt(req.query.limit,10)||10;
    const startIndex=(page-1)*limit;
    const endIndex = page*limit;
    
    try{
        const total = await TimeSlot.countDocuments();
        query = query.skip(startIndex).limit(limit);
        const timeslots = await query;
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
        res.status(200).json({success:true, count:timeslots.length, data:timeslots});
    }catch(err){
        console.error(err);
        res.status(400).json({success:false , msg : 'Something Wrong'});
    }
}

exports.getTimeslot = async (req , res , next) => {
    try {
        const timeslot = await TimeSlot.findById(req.params.id).populate({
            path: 'company',
            select: 'name tel contact_email'
        });

        if (!timeslot)
            return res.status(404).json({success : false , msg : "Can not find timeslot with id : " + req.params.id});

        res.status(200).json({success : true , timeslot})
    }
    catch(err) {
        console.error(err)
        res.status(400).json({success : false , msg : "Something Wrong"})
    }
}