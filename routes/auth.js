const express = require('express')
const {register_user , login_user , getRegUser , logout , updateUser , getAllUsers} = require('../controller/auth')
const {protect,authorize} = require('../middleware/auth')

const router = express.Router()

router.post('/register' ,  register_user)
router.post('/login' , login_user)
router.get('/me' , protect , getRegUser)
router.post('/me' , protect , updateUser)
router.get('/logout',logout)
router.get('/alluser', protect, authorize('admin'), getAllUsers);


module.exports = router