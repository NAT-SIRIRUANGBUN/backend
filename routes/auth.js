const express = require('express')
const {register_user , login_user , getRegUser , logout} = require('../controller/auth')
const {protect} = require('../middleware/auth')

const router = express.Router()

router.post('/register' ,  register_user)
router.post('/login' , login_user)
router.get('/me' , protect , getRegUser)
router.get('/logout',logout)

module.exports = router