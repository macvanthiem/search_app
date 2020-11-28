const express = require('express');
const router = express.Router();
const controller = require('../controllers/Controller');

router.route('/')
    .get(controller.index)
    .post(controller.search);

router.route('/create')
    .get(controller.create)
    .post(controller.store);

router.route('/detail/:id')
    .get(controller.show);

module.exports = router;