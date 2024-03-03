const express = require('express')
const {getTimeslots , getTimeslot} = require('../controller/timeslot')
const reservationRouter = require('./reservation');
const {protect,authorize} = require('../middleware/auth');

const router = express.Router()
router.use('/:timeslotId/reservation/',reservationRouter);

router.route('/').get(protect,authorize('user','admin'),getTimeslots)
router.route('/:id').get(protect,authorize('user' , 'company' ,'admin'),getTimeslot)

module.exports = router