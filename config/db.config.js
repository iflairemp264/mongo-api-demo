//db config 
module.exports = function() {
    return config = {
        "dbName": "dbname",
        "connection": "mongodb://127.0.0.1/",
        "authSource": "?authSource=admin",
        "Imailer": "**********************",
        "mailPort": 465,
        "fromImailer": "*******************",
        "nodemailerTransport": {
            host: '*************',
            port: 587,
            secure: false,
            auth: {
                user: "***************", // generated ethereal user
                pass: "**************" // generated ethereal password
            },
            tls: {
                ignoreTLS: true,
                rejectUnauthorized: false
            }
        }
    }


}();