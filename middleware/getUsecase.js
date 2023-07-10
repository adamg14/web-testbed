const project = require("../models/project");

// this function gets information about the usecase from the database
// used by the server to get information about the usecase such as the commands and the path to the files
async function getUsecase(projectId, usecaseId){
    try {
        // query to find the project with the projectId argument from the database
        let selectedProject = await project.findOne({projectId: projectId});
        if (selectedProject === null){
            // if the query which finds the project returns null - the project does not exist and return this error message
            return "error - project does not exist";
        }else{
            // get the usecase array from the project object returned by the database query
            let selectedUsecases = selectedProject.usecases;
            for (let i = 0; i < selectedUsecases.length; i++){
                // for each of the elements in the usecase array, compare the usecaseId to the usecaseId passed as an argument - if there is a match the function will return the usecase database object
                if (selectedUsecases[i].usecaseId === usecaseId){
                    return selectedUsecases[i];
                }else{
                    continue
                }
            }
            // if none of the usecase elements have a usecaseId that matches with the usecaseId in the document return this error message
            return "error - usecase does not exist";
        }
    } catch (error) {
        return "database error";
    }
}

module.exports = getUsecase;