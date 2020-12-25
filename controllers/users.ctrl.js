var Users = require('../models/users.model');
var Token = require('../models/token.model');
var settings = require('../config/db.config');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(settings.nodemailerTransport);

function firevmail(reqdata) {
    var mailOptions = {
        from: settings.fromImailer,
        to: reqdata.email,
        subject: reqdata.subject,
        html: reqdata.msg
    };
    mailOpt = mailOptions;
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("error while sending email", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

exports.create = async (req, res) => {

    if (req.body.email && req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        req.body.status = 'pending';
        var userdata = new Users(req.body);
        await userdata.save(
            function (err, dta) {
                if (err) {
                    var e = "";
                    if (err.code == 11000) {
                        e = "User already exists with same emailaddress";
                    } else {
                        e = err;
                    }
                    return res.status(400).json({ msg: e });
                }
                // Create a verification token for this user
                var token = new Token({ _userId: userdata._id, token: crypto.randomBytes(16).toString('hex') });
                // Save the verification token
                token.save(function (err) {
                    if (err) { return res.status(500).send({ msg: err.message }); }
                    let mailOptions = {
                        "email": req.body.email,
                        "subject": " User registration verification",
                        "msg": `Hello,Please verify your account by clicking the link:
                        <a href="http://${req.headers.host}/confirmation/${token.token}"> Click here</a>`
                    }
                    firevmail(mailOptions);
                    res.status(200).send({ message: "Verification email has been sent to your email address.Please verify", data: dta });
                });
            });
    } else {
        res.status(422).json({ message: 'Invalid Inputs.' });
    }
}

exports.findAll = (req, res) => {

    Users.find().select("-password").populate({
        path: "role"
    }).exec(function (er, usr) {
        if (er) {
            res.status(500).send(err)
        }
        else {
            if (usr.length) res.status(200).send(usr);
            else res.send({ message: "No data found" });
        }
    });
}

exports.findOne = (req, res) => {
    Users.findById(req.params.id).select("-password").populate({
        path: "role"
    })
        .exec(function (err, usr) {
            if (!usr) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.id
                });
            }
            if (err) res.status(500).send(err);
            else res.status(200).send(usr);
        })
};

exports.update = (req, res) => {
    const id = req.params.id;

    Users.findByIdAndUpdate(id, { $set: req.body }, { new: true })
        .select("-password").populate({
            path: "role"
        }).exec(function (err, usr) {
            if (err) res.status(200).send(err);
            else res.status(200).send(usr)
        })
}

exports.delete = (req, res) => {
    const id = req.params.id;
    Users.findByIdAndRemove(id)
        .then(usr => {
            if (!usr) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.id
                });
            }
            res.status(200).send({ message: "User deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "User not found with id " + req.params.id
                });
            }
            return res.status(500).send({
                message: "Could not delete User with id " + req.params.id
            });
        });
}

//login
exports.login = async (req, res) => {
    if (req.body.email && req.body.password) {
        var user = await Users.findOne({ email: req.body.email }).populate({ path: 'role' }).exec();
        if (!user) {
            return res.status(400).send({ message: "The username does not exist" });
        }
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(400).send({ message: "The password is invalid" });
        }
        // Make sure the user has been verified
        if (user.status !== 'verified') return res.status(401).send({ type: 'not-verified', message: 'Your account has not been verified.' });
        // res.send({ token: generateToken(user), user: user.toJSON() });
        res.status(200).send({ message: "Login Successfully!" });
    }
    else {
        res.status(500).send({ message: "Could not found data" })
    }
}

exports.confirmationPost = (req, res) => {
    Token.findOne({ token: req.body.token }, function (err, token) {
        if (!token) return res.status(400).send({ type: 'not-verified', message: 'We were unable to find a valid token. Your token my have expired.' });
        // If we found a token, find a matching user
        Users.findOne({ _id: token._userId, email: req.body.email }, function (err, user) {
            if (!user) return res.status(400).send({ message: 'We were unable to find a user for this email address.' });
            if (user.status == 'verified') return res.status(400).send({ type: 'already-verified', message: 'This user has already been verified.' });
            Users.findByIdAndUpdate({ _id: user._id }, { $set: { status: 'verified' } }, { upsert: true },
                function (err, ress) {
                    if (err) { res.status(500).send({ message: err }) }
                    else res.status(400).send({ message: "You account has been verified please login" });
                })
        });
    });
}

exports.resendTokenPost = (req, res) => {
    Users.findOne({ email: req.body.email }, function (err, user) {
        if (!user) return res.status(400).send({ message: 'We were unable to find a user with that email.' });
        if (user.status == 'verified') return res.status(400).send({ message: 'This account has already been verified. Please log in.' });

        // Create a verification token, save it, and send email
        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

        // Save the token
        token.save(function (err) {
            if (err) { return res.status(500).send({ message: err.message }); }
            let mailOptions = {
                "email": req.body.email,
                "subject": " User registration verification",
                "msg": `Hello,Please verify your account by clicking the link:
                <a href="http://${req.headers.host}/confirmation/${token.token}"> Click here</a>`
            }
            firevmail(mailOptions);
            res.status(200).send({ message: "Verification email has been sent to your email address.Please verify" });
        });

    });
}

exports.changePw = (req, res) => {
    var newpassword = req.body.newpassword
    Users.findOne({ _id: req.params.id }).exec(function (err, user) {
        if (user) {
            if (!bcrypt.compareSync(req.body.oldpassword, user.password)) {
                return res.status(404).json({ message: 'Your Password is Incorrect!' });
            }
            else {
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) return err;
                    bcrypt.hash(newpassword, salt, (er, hash) => {
                        if (er) return next(er);
                        newpassword = hash;
                        var updatePass = {
                            password: newpassword
                        };
                        Users.findOneAndUpdate({ _id: req.params.id },{ $set: updatePass }, { new: true }, function (err, usrrsdata) {
                            if (err) {
                                return res.send(err)
                            } else {
                                return res.status(200).json({ message: 'Password has been changed!!' });
                            }
                        });
                    });
                });
            }
        }
        else {
            res.status(404).send({ message: " User Not found" })
        }
    })
}

exports.forgotPw = (req,res) => {
    rand = Math.random().toPrecision(6).substring(2);
    if (rand.length >= 7) {
        rand = rand.substr(0, 6);
    }
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return err;
        bcrypt.hash(rand, salt, (er, hash) => {
            if (er) return next(er);
            var updateObject = {
                password: hash
            };
            Users.findOneAndUpdate({ email: req.body.email }, { $set: updateObject }, { new: true }, function (er, dt) {
                if (er) {
                    console.log('error occured..' + er);
                    return er;
                }
                else if (dt && dt.email) {
                    let mailOptions = {
                        "email": req.body.email,
                        "subject": "New Password for Cure Finance",
                        "msg": `Hello,Please login your account by this temporary password ${rand}`
                    }
                    firevmail(mailOptions);
                    return res.status(200).json({ message:'Your new password has been sent to your email address'});
                }
                else {
                    return res.status(404).json({ message: 'Data Not Found!' });
                }
            })
        });
    });
}

