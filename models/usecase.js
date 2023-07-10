const mongoose = require("mongoose");

const usecaseSchema = mongoose.Schema({
    // id just incase
    usecaseId: String,
    // usecaseDescription: String,
    originalFolderPath: String,
    testingFilePath: String,
    commands: [{type: String}]
});

module.exports = usecaseSchema;