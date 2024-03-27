const User = require('../models/User')
const {Company} = require('../models/Company')


//@desc     Register new user
//@router   POST /api/auth/register
//@access   Public
exports.register_user = async (req , res , next) => {
    try {
        const newuser = await User.create(req.body)
        sendTokenResponse(newuser , 201 , res)
    }
    catch(err) {
        console.error(err);
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
        res.status(401).json({success:false})
    }
}

//@desc     Get current logged in user
//@route    GET /api/auth/me
//@access   Private
exports.getRegUser = async (req , res , next) => {
    const user = await User.findById(req.user.id).populate({
        path : 'reservation',
        populate : {
            path : 'timeslot',
            poulate : {
                path : 'company',
                select : 'name'
            }
        }
    })
    if(!user){
        return res.status(404).json({success:false , msg:'Can not find this user'})
    }
    res.status(200).json({
        success : true,
        data : user
    })
}

exports.updateUser = async (req , res , next) => {

    const thisUser = await User.findById(req.user.id)

    if (!thisUser)
        return res.status(404).json({success:false , msg:'Can not find this user'})
    
    const newData = {}

    if (req.body.name)
        newData.name = req.body.name
    
    if (req.body.email)
        newData.email = req.body.email
    
    if (req.body.tel)
        newData.tel = req.body.tel

    if (req.body.imageurl)
        newData.imageurl = req.body.imageurl

    try {
        const UpdateUser = await User.findByIdAndUpdate(req.user.id , newData , {new: true , runValidators: true}  )

        res.status(200).json( {
            success : true , 
            data : UpdateUser
        })
    }
    catch(err) {
        console.error(err)
        res.status(400).json({success : false})
    }
    
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
