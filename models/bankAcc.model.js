var mongoose = require('mongoose');
Schema = mongoose.Schema;

var bankAccSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    holder_name: String,
    acc_number: { type: String, unique: true },
    cvv_number: String,
    bank_code: String,
    phone: Number,
    total_amt: String,
    isVerified: { type: Boolean, default: false }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('bankDetails', bankAccSchema);

// twillo
// Dhruvika@12345
// ac-id : AC0d4e18cb7dde31bdb4a1b09169469a6e
// token : a30ad9b8dc719773a8cb997d9d12c7a3
// (205) 973-5118
