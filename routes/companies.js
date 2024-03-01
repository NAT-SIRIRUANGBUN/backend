const express = require('express');
const {getCompanys , getCompany , createCompany , updateCompany , deleteCompany} = require('../controller/companies');

const router = express.Router();

router.route('/').get(getCompanys).post(createCompany);
router.route('/:id').get(getCompany).put(updateCompany).delete(deleteCompany);

module.exports = router ;