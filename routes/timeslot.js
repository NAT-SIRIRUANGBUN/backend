const express = require('express')
const {getTimeslot} = require('../controller/timeslot')

const router = express.Router()

router.route('/').get(getTimeslot)

module.exports = router