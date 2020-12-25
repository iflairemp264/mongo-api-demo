var BankDetail = require('../models/bankAcc.model');
var Otp = require('../models/otp.model');
const accountSid = '**************token';
const authToken = '********************token';
const client = require('twilio')(accountSid, authToken);

function sendOtp(reqdata) {
    console.log("Req dataa::",reqdata)
    client.messages
        .create({
            body: reqdata.msg,
            from: '+12059735118',
            to: `+91${reqdata.phone}`
        })
        .then(message => {
            console.log("OTP::", message.sid)
            res.send({ msg: message })
        });
}

exports.create = async (req, res) => {

    var otp = Math.floor(1000 + Math.random() * 9000);
    console.log("Otp:",otp)
    var bankData = new BankDetail(req.body);
    await bankData.save(
        function (err, dta) {
            if (err) {
                if (err.code == 11000) res.status(500).send({ message: 'Account number already exists' })
                else res.status(500).send({ message: err });
            }
            var otpSave = new Otp({ recordId: dta._id, otp: otp });
            otpSave.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                else {
                    var dataObj = {
                        msg: `OTP for verification from Cure Fianance is ${otp}`,
                        phone: req.body.phone
                    }
                    // send sms otp
                    // sendOtp(dataObj);
                    res.status(200).send({ message: 'OTP send to your mobile number please verify' });
                }
            })
        })
}

exports.findAll = (req, res) => {
    BankDetail.find().populate({
        path: "userId"
    }).exec(function (er, dt) {
        if (er) {
            res.status(500).send(err)
        }
        else {
            if (dt.length) res.status(200).send(dt);
            else res.send({ message: "No data found" });
        }
    });
}

exports.findOne = (req, res) => {
    BankDetail.findById(req.params.id).populate({
        path: "userId"
    })
        .exec(function (err, record) {
            if (!record) {
                return res.status(404).send({
                    message: "Record not found with id " + req.params.id
                });
            }
            if (err) res.status(500).send(err);
            else res.status(200).send(record);
        })
}

exports.delete = (req, res) => {
    const id = req.params.id;
    BankDetail.findByIdAndRemove(id)
        .then(usr => {
            if (!usr) {
                return res.status(404).send({
                    message: "Record not found with id " + req.params.id
                });
            }
            res.status(200).send({ message: "Record deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Record not found with id " + req.params.id
                });
            }
            return res.status(500).send({
                message: "Could not delete record with id " + req.params.id
            });
        });
}

exports.verifyOtp = (req, res) => {
    Otp.findOne({ 'otp': req.body.otp }, (err, dta) => {
        if (err) res.status(500).send({ message: err })
        if (dta) {
            const bankId = dta.recordId;
            BankDetail.findOneAndUpdate({ _id: bankId }, { isVerified: true }).then(ress => {
            }).catch(err => {
                res.send(err)
            })
            res.status(200).send({ message: "Verified" })
        }
        else {
            res.send({ message: 'Wrong otp or otp expired' })
        }
    })
}

exports.resendOtp = (req, res) => {
    BankDetail.findOne({ phone: req.body.phone }, function (err, user) {
        if (!user) return res.status(400).send({ message: 'We were unable to find your registered phone number' });
        if (user.isVerified) return res.status(400).send({ message: 'Already verified.' });
        var otpSave = new Otp({ recordId: dta._id, otp: otp });
        otpSave.save(function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }
            else {
                var dataObj = {
                    msg: `OTP for verification from Cure Fianance is ${otp}`,
                    phone: req.body.phone
                }
                //send sms otp
                // sendOtp(dataObj);
                res.status(200).send({ message: 'OTP send to your mobile number please verify' });
            }
        })
    });
}
