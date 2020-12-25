var express = require('express');
var router = express.Router();
const roles = require('../controllers/roles.ctrl');

router.post('/', roles.create);
router.get('/', roles.findAll);

module.exports = router;
