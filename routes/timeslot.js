const express = require('express')
const {getTimeslots , getTimeslot} = require('../controller/timeslot')
const reservationRouter = require('./reservation');
const {protect,authorize} = require('../middleware/auth');

const router = express.Router()
router.use('/:timeslotId/reservation/',reservationRouter);

router.route('/').get(protect,getTimeslots)
router.route('/:id').get(protect,getTimeslot)

module.exports = router