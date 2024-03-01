const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req , res , next) => {
    let token 

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1]

    if (!token)
        return res.status(401).json({success : false , msg : "No Token to access this route"})
    
    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET)

        console.log(decoded)

        req.user = await User.findById(decoded.id)

        next()
    }

    catch(err) {
        console.error(err.stack)
        return res.status(401).json({success : false , msg : "Faild to verify token or can not find user with provided token"})
    }
}