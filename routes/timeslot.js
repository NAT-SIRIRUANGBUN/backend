const express = require('express')
const {getTimeslots , getTimeslot} = require('../controller/timeslot')
const reservationRouter = require('./reservation');

const router = express.Router()
router.use('/:timeslotId/reservation/',reservationRouter);

router.route('/').get(getTimeslots)
router.route('/:id').get(getTimeslot)

module.exports = router