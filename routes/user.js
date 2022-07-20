const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const userVerif = require('../middleware/userVerif');

router.post('/signup', userVerif, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;