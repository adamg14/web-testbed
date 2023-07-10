const project = require("../models/project");
const path = require("path");

// this middleware function is used to move the student files uploaded to the server to the correct route
async function moveStudentFiles(files, copyPath, selectedUsecase, projectNamingConvention){
    try {
        // for each of the files that the student uploaded, which are in the request.files 
        for (let i = 0; i < Object.keys(files).length; i++){
            console.log(Object.values(files)[i].name);
            // the name of the file is the one defined in the - or the original name of the file if it is a student file which is uploaded as a suppliment to the ones required
            let fileName = projectNamingConvention[i] || Object.values(files)[i].name;
            // defining the path where the student files should reside (in the correct copy of the staff project) in a way that is OS independent- using the path NPM module
            let movePath = path.join(copyPath, selectedUsecase.testingFilePath, fileName);
            // use the mv method that all files in the request.files request have to move the file to the correct path on the server
            Object.values(files)[i].mv(movePath);
        }
        return true;
    } catch (error) {
        // if there are any errors with the file handling within this function - this error message is returned by the function
        return "An error has occurred when moving your files to the directory of the project. This may be due to an error in the staff upload.";
    }
}

module.exports = moveStudentFiles;