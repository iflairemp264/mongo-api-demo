var mongoose = require('mongoose');

Schema = mongoose.Schema;
var userSchema = new Schema({
    firstName:String,
    lastName:String,
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'roles' },
    userName:{type:String},
    email:{type:String,unique:true},
    password: String,
    status: String
},
{
    timestamps: true
});
    
module.exports = mongoose.model('users', userSchema);
// liquidity = curr-assets / curr-liability