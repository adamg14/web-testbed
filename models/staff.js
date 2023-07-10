const mongoose = require("mongoose");

// need to add unique etc
const staffSchema = mongoose.Schema({
    staffId: {
        type: String,
        unique: true,
        required: true,
    },

    email: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },
    
    code2FA: String
});

const staff = mongoose.model("Staff", staffSchema);

module.exports = staff;