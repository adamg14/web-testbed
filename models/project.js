const mongoose = require("mongoose");
const usecaseSchema = require("./usecase");

mongoose.connect('mongodb+srv://admin:UdzGMhfc8bXmI7mt@cluster0.sc1aozc.mongodb.net/testbed?retryWrites=true&w=majority');

const projectSchema = mongoose.Schema({
    projectId: String,
    projectName: String,
    projectDescription: String,
    programmingLanguage: String,
    programmingLanguageVersion: String,
    numberOfFiles: Number,
    testingFilePath: String,
    namingConvention: [String],
    usecases: [usecaseSchema],
    dateAdded: Date,
    staffId: String
});

module.exports = mongoose.model("Project", projectSchema);