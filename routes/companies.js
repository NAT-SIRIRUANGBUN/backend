const express = require('express');
const {getCompanys , getCompany , createCompany , updateCompany , deleteCompany} = require('../controller/companies');
const {protect} = require('../middleware/auth')
const router = express.Router();

router.route('/').get(getCompanys).post(protect , createCompany);
router.route('/:id').get(getCompany).put(protect , updateCompany).delete(protect , deleteCompany);

module.exports = router ;