//@DESC Get all companys
//@route GET /api/v1/companys
//@access Public
exports.getCompanys = (req,res,next) => {
    res.status(200).json({success: true, msg: 'Show all companys'});
};

//@DESC Get single company
//@route GET /api/v1/companys/:id
//@access Public
exports.getCompany = (req,res,next) => {
    res.status(200).json({success: true, msg: `Show company ${req.params.id}`});
};

//@DESC Create new company
//@route GET /api/v1/companys
//@access Private
exports.createCompany = (req,res,next) => {
    res.status(200).json({success: true, msg: 'Create new company'});
};

//@DESC Update company
//@route PUT /api/v1/companys/:id
//@access Private
exports.updateCompany = (req,res,next) => {
    res.status(200).json({success: true, msg: `Update company ${req.params.id}`});
};

//@DESC Delete company
//@route DELETE /api/v1/companys/:id
//@access Private
exports.deleteCompany = (req,res,next) => {
    res.status(200).json({success: true, msg: `Delete company ${req.params.id}`});
};