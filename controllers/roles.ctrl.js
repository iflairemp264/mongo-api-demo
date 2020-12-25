const Roles = require('../models/roles.model');

exports.create = (req, res) => {
    if(!req.body.title) {
        return res.status(400).send({
            message: "Role content can not be empty"
        });
    }
    const role = new Roles({
        title: req.body.title || "Untitled Role",
        status:req.body.status 
    });

    // Save roles in the database
    role.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Roles."
        });
    });
};

exports.findAll = (req, res) => {
    Roles.find()
    .then(roles => {
        if(roles.length) res.send(roles);
        else res.send({message:"No data found"});
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving Roles."
        });
    });
};
