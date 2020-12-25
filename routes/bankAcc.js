var express = require('express');
var router = express.Router();
var bankAcc = require('../controllers/bankAcc.ctrl')

router.get('/',bankAcc.findAll);
router.post('/',bankAcc.create);
router.get('/:id',bankAcc.findOne);
router.delete('/:id',bankAcc.delete);
router.post('/verifyOtp',bankAcc.verifyOtp);
router.post('/resendOtp',bankAcc.resendOtp);


module.exports = router;



