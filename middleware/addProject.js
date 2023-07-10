const mongoose = require("mongoose");
const project = require("../models/project");
const usecase = require("../models/usecase");
const puid = require("puid");
const fs = require("fs");
const mongooseSanitise = require("mongo-sanitize");

// the directory in which this file resides - the middleware subdirectory
const directory = __dirname;
// the main directory of the server - without the middleware subdirectory
const mainDirectoryname = __dirname.substring(0, directory.length - 11);

async function addProject(projectId, projectName, projectDescription, programmingLanguage, programmingLanguageVersion, numberOfFiles, testingFilePath, namingConvention, staffId){
    try {
        let namingConventionArray = namingConvention.split("|");
        let currentDate = new Date();

        // create a directory for the project to reside in
        fs.mkdirSync(mainDirectoryname + "/projects/" + projectId);

        // add the project to the database
        let newProject = new project({
            projectId: String(projectId),
            projectName: String(projectName),
            projectDescription: String(projectDescription),
            programmingLanguage: String(programmingLanguage),
            numberOfFiles: numberOfFiles,
            testingFilePath: String(testingFilePath),
            programmingLanguageVersion: String(programmingLanguageVersion),
            namingConvention: namingConventionArray,
            dateAdded: currentDate,
            staffId: staffId
        });
        
        // tells the async function to wait until the document is saved into the document
        await newProject.save();
        // once the project is added to the database the function will return true
        return true;
    } catch (error) {
        // if any error occurs in the function, e.g. connection to the database is lost the function will return an error message
        return "An error occurred when adding the project.";
    }
}

module.exports = addProject;