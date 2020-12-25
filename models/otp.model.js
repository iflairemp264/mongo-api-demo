var mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
    recordId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'bankDetails' },
    otp: { type: String, required: true }
}, { timestamps: true });

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('otps', otpSchema);
