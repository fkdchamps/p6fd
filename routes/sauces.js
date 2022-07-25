/* fichier des routes d'API attendues sur requête pour gérer des sauces */
const express = require("express");
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');
const sauceCtrl = require("../controllers/sauce");


    
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.get('/', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
module.exports = router;
