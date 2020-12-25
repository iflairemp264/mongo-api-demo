var express = require('express');
var router = express.Router();
var users = require('../controllers/users.ctrl')

router.get('/',users.findAll);
router.post('/',users.create);
router.post('/login',users.login);
router.get('/:id',users.findOne);
router.put('/:id',users.update);
router.delete('/:id',users.delete);
router.post('/confirmation', users.confirmationPost);
router.post('/resend', users.resendTokenPost);
router.post('/changepassword/:id',users.changePw)
router.post('/forgotpassword',users.forgotPw)

module.exports = router;
