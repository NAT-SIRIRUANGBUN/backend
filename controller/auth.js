const User = require('../models/User')

//@desc     Register new user
//@router   POST /api/auth/register
//@access   Public
exports.register = async (req , res , next) => {
    try {
        const {name , email , password , role , tel} = req.body
        const newuser = await User.create({name , email , password , role , tel})
        sendTokenResponse(newuser , 200 , res)
    }
    catch(err) {
        res.status(400).json({success : false})
        console.error(err)
    }
}

//@desc     Login user
//@route    POST /api/auth/login
//@acess    Public
exports.login = async (req , res , next) => {
    try {
        const {email , password} = req.body

        if (!email || !password)
            return res.status(400).json({success : false , msg : "Please provide an email and password"})

        const thisuser = await User.findOne({email}).select('+password')

        if (!thisuser)
            return res.status(404).json({success : false , msg : "Can not find user with this email"})

        const isMatch = await thisuser.matchPassword(password)

        if (!isMatch)
            res.status(401).json({success : false , msg : "Wrong email or password"})

        sendTokenResponse(thisuser , 200 , res)
    }
    catch(err) {
        console.error(err)
    }
}

const sendTokenResponse = (user , statusCode , res) => {
     const token = user.getSignedJwtToken()

     const options = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly : true
     }

     if (process.env.NODE_ENV === 'production')
        options.secure = true
    
        res.status(statusCode).cookie('token' , token , options).json({success : true , token})
}