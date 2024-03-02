const jwt = require('jsonwebtoken')
const User = require('../models/User')
const {Company} = require('../models/Company')

exports.protect = async (req , res , next) => {
    let token 
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1]
    
    if (!token || token == 'null')
        return res.status(401).json({success : false , msg : "No Token to access this route"})
    
    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        if (decoded.type === 'User')
            req.user = await User.findById(decoded.id)
        else if (decoded.type === 'Company') {
            req.user = await Company.findById(decoded.id)
            req.user.role = 'company'
        }
        next()
    }catch(err) {
        console.error(err.stack)
        return res.status(401).json({success : false , msg : "Faild to verify token or can not find user with provided token"})
    }
}

exports.authorize=(...roles)=>{
    return (req,res,next) =>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success:false,msg:`User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    }
}