const User = require('../models/User')
const {Company} = require('../models/Company')


//@desc     Register new user
//@router   POST /api/auth/register
//@access   Public
exports.register_user = async (req , res , next) => {
    try {
        const {name , email , password , role , tel} = req.body
        const newuser = await User.create({name , email , password , role , tel})
        sendTokenResponse(newuser , 200 , res)
    }
    catch(err) {
        console.error(error);
        res.status(400).json({success : false})
    }
}

//@desc     Login user
//@route    POST /api/auth/login
//@acess    Public
exports.login_user = async (req , res , next) => {
    try {
        const {email , password} = req.body

        if (!email || !password)
            return res.status(400).json({success : false , msg : "Please provide an email and password"})

        const thisUser = await User.findOne({email}).select('+password')

        if (!thisUser)
            return res.status(404).json({success : false , msg : "Can not find user with this email"})

        const isMatch = await thisUser.matchPassword(password)

        if (!isMatch)
            return res.status(401).json({success : false , msg : "Wrong email or password"})

        sendTokenResponse(thisUser , 200 , res)
    }
    catch(err) {
        console.error(err)
    }
}

//@desc     Get current logged in user
//@route    POST /api/auth/me
//@access   Private
exports.getRegUser = async (req , res , next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success : true,
        data : user
    })
}

exports.login_company = async (req , res , next) => {
    const {email , password} = req.body

    if (!email || !password)
            return res.status(400).json({success : false , msg : "Please provide an email and password"})

        const thisCompany = await Company.findOne({login_email : email}).select('+password')

        if (!thisCompany)
            return res.status(404).json({success : false , msg : "Can not find company with this email"})

        const isMatch = await thisCompany.matchPassword(password)

        if (!isMatch)
            return res.status(401).json({success : false , msg : "Wrong email or password"})

        sendTokenResponse(thisCompany , 200 , res)
}


//Inner function
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


//@desc     Log current user out
//@route    POST /api/auth/logout
//@access   Private
exports.logout = async(req,res,next)=>{
    res.cookie('token','none',{
        expires: new Date(Date.now()+10*1000),
        httpOnly:true
    })

    res.status(200).json({
        success: true,
        data:{}
    })
}
