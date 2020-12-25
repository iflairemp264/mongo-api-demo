var mongoose = require('mongoose');
const tokenSchema = new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
    token: { type: String, required: true }
}, { timestamps: true });
tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
module.exports = mongoose.model('tokens', tokenSchema);
