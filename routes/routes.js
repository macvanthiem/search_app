const express = require('express');
const router = express.Router();
const controller = require('../controllers/Controller');

router.route('/')
    .get(controller.index);

router.route('/create')
    .get(controller.create)
    .post(controller.store);

module.exports = router;