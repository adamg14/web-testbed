const project = require("../models/project");
const fse = require("fs-extra");
const path = require("path");
// to delete a usecase from the database an element must be removed from the array within the database
// https://stackoverflow.com/questions/42474045/mongoose-remove-element-in-array-using-pull
// Lines: 13 - 15 were adapted from a stackoverflow answer to carry out this database query

// the directory in which this js file recides in using the javascript environment variable __dirname
let directory = __dirname;
// the main directory of the server without the middleware subdirectory
let mainDirectory = directory.substring(0, directory.length - 11);

// the purpose of this function is to delete the usecase from the database - in the web application this function is called on the request of the staff member who added the usecase
async function deleteUsecase(projectId, usecaseId){
    try {
        // the function sends a query to the database to delete the requested usecase from the project document by removing the element from the usecase array in the project document
        let foundProject = await project.findOneAndUpdate({projectId: projectId}, {$pull: {
            usecases: {
                usecaseId: usecaseId
            }
        }});

        // the path to the specific usecase in the server files written in a OS independent way
        let usecasePath = path.join(mainDirectory, "projects", projectId, usecaseId);
        // let usecasePath = mainDirectory + "/projects/" + projectId + "/" + usecaseId;
        // delete the usecase files from the server
        fse.removeSync(usecasePath);
        // once the files are deleted and the usecase is removed from the database return the string "deleted usecase"
        return "deleted usecase";
    } catch (error) {
        // if an error has occurred this is catched by the function and an error message is returned by the function
        return "An unexpected error has occurred.";
    }
}

module.exports = deleteUsecase;