const express = require('express');
const {getCompanies , getCompany , createCompany , updateCompany , deleteCompany , getCompanyTimeSlot , createTimeslot , updateTimeslot , deleteTimeslot , getCompanyDetail} = require('../controller/companies');
const {login_company , logout} = require('../controller/auth')
const {protect,authorize} = require('../middleware/auth')
const router = express.Router();

router.route('/').get(getCompanies).post(protect , authorize('admin') , createCompany);
router.route('/:id').get(getCompany).put(protect , authorize('admin','company') , updateCompany).delete(protect , authorize('admin','company'), deleteCompany);
router.route('/auth/login').post(login_company)
router.route('/auth/logout').get(logout)
router.route('/auth/getdetail').get(protect , authorize('company') , getCompanyDetail)
router.route('/:id/timeslot').get(getCompanyTimeSlot).post(protect , authorize('admin','company') , createTimeslot)
router.route('/:id/timeslot/:timeslotid').put(protect , authorize('admin','company') , updateTimeslot).delete(protect , authorize('admin','company') , deleteTimeslot)

module.exports = router ;