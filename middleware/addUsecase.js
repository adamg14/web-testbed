const project = require("../models/project");
const usecase = require("../models/usecase");
const AdmZip = require("adm-zip");
const fs = require("fs");
const mongoose = require("mongoose");
const decompress = require("decompress");
const getProject = require("./getProject");
const deleteProject = require("./deleteProject");
const path = require("path");
const systeminformation = require("systeminformation");

// /Users/adam/Documents/new-upload/middleware
const directory = __dirname;

// the main directory name of the server without the middleware subdirectory
// /Users/adam/Documents/new-upload
const mainDirectoryname = __dirname.substring(0, directory.length - 11);



async function addUsecase(request, response, projectId, usecaseId) {
    try {

        // The staff uploaded project, .zipfile
        let projectZipFile = request.files.projectFolderUpload;
        // the name of the staff uploaded file, .zipfile
        let projectZipFileName = String(request.files.projectFolderUpload.name);
        // the name of the directory, is the name of the file without the .zip extention name
        let directoryName = projectZipFileName.substring(0, projectZipFileName.length - 4);
        let newDirectory;
        // depending on which os the machine is on, depends on how the function will work
        await systeminformation.osInfo().then(function (os) {
            // if the machine in os
            if (os.platform === "darwin") {
                newDirectory = path.join(mainDirectoryname, "projects", projectId, usecaseId);
            } else {
                newDirectory = path.join(mainDirectoryname, "projects", projectId, usecaseId);
            }
        });

        // a directory for the usecase to reside in
        // the recursive option will mean the function will not throw an error if the directory already exists
        // the project directory already exists because it is created when the project is created prior to the usecase being added, the project also may already exist when a usecase is added
        fs.mkdirSync(newDirectory, { recursive: true });

        // the path that the staff upload will reside in
        let zipFilePath = path.join(newDirectory, projectZipFileName);
        // tells the async function to wait for the staff upload zip file to be moved in the directory specified
        await projectZipFile.mv(zipFilePath);
        // the decompress function will unzip the zip file in the directory specified and the async function will wait for this task to finsih
        await decompress(zipFilePath, newDirectory);

        // details of the project to add to the database
        // if it is a mac the directory name should be added to the path that is stored in the database
        let projectPath;
        // depending on the OS of the machine, 
        await systeminformation.osInfo().then(function(os){
            if(os.platform === "darwin"){
                projectPath = path.join(newDirectory, directoryName);
            }else{
                projectPath = path.join(newDirectory, directoryName)
            }
        });

        let commands = request.body.commands;
        // the commmands submitted are separated into elements of the array, | is the characted used to separate the commands.
        let commandsArray = commands.split("|");
        // the sub directory of the staff upload that the code resides in - also where the subdirectory where the student files should be moved to
        let stringPath = String(request.body.testingfilePath);

        // the async function waits for the getProject function to return the project where the corresponding projectId argument. Once the getProject function finds the project function, the usecase is added to the array of usecases within the project 
        await getProject(projectId).then(function (selectedProject) {
            // the usecase collected above is pushed into the usecase array in the project schema
            selectedProject.usecases.push({
                usecaseId: usecaseId,
                originalFolderPath: projectPath,
                testingFilePath: stringPath,
                commands: commandsArray
            });

            // save the changes ade
            selectedProject.save();
        });

        // once the usecase is added to the database and the files of the uscase have been added accordingly a success message is rendered to the user on the frontend 
        return response.status(200).render("success", { successMessage: "Usecase added to the project.", link: "/staff-dashboard", linkName: "Staff Dashboard" });

    } catch (error) {
        // console log line only purpose for this was to help with debugging
        console.log("THIS IS THE ERROR THAT IS OCCURING " + error);
        // if an error occurs in adding the usecase, delete the whole project and return an error message to the user
        deleteProject(projectId).then(function (deleteProjectResult) {
            return response.status(400).render("failure", { failureMessage: "An error occurred when adding a usecase. This may be due to an internet fault. Please try again.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
        });
    }
}



module.exports = addUsecase;

