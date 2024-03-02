const express = require('express')
const {getTimeslots , getTimeslot} = require('../controller/timeslot')

const router = express.Router()

router.route('/').get(getTimeslots)
router.route('/:id').get(getTimeslot)

module.exports = router