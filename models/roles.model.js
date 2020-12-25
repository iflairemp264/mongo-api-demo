var mongoose = require('mongoose');
Schema = mongoose.Schema;
var rolesSchema = new Schema({
    title: String,
    status: Boolean
},
    {
        timestamps: true
    });
    
module.exports = mongoose.model('roles', rolesSchema);