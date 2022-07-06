const express = require("express");
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');
const stuffCtrl = require("../controllers/stuff");


    
router.put('/:id', auth, multer, stuffCtrl.modifySauce);
router.post('/', auth, multer, stuffCtrl.createSauce);
router.delete('/:id', auth, stuffCtrl.deleteSauce);
router.get('/', auth, stuffCtrl.getAllStuff);
router.get('/:id', auth, stuffCtrl.getOneSauce);
module.exports = router;
