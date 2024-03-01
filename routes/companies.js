const express = require('express');
const {getCompanies , getCompany , createCompany , updateCompany , deleteCompany} = require('../controller/companies');
const {protect,authorize} = require('../middleware/auth')
const router = express.Router();

router.route('/').get(getCompanies).post(protect , authorize('admin') , createCompany);
router.route('/:id').get(getCompany).put(protect , authorize('admin','company') , updateCompany).delete(protect , authorize('admin','company'), deleteCompany);

module.exports = router ;