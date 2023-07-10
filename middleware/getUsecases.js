const project = require("../models/project");

// this function returns all the usecases that a project has
// used by the server 
// also used to render the frontend so that a student can select a usecase that they can run their code against

async function getUsecases(projectId){
    try {
        // a query to return a project from the database, with the projectId matching the one passed in as the argument to the function
        let selectedProject = await project.findOne({projectId: projectId});
        if (selectedProject === null){
            // if the query returns null - the project does not exist and an error message is returned by the function
            return "error - project does not exist"
        }else{
            // the usecase are the array within the usecases array in the database - this is returned by the function
            let usecases = selectedProject.usecases;
            return usecases;
        }
    } catch (error) {
        // if an error occurs when sending the query to the database this string is returned by the function as an error message
        return "error"
    }
}


module.exports = getUsecases;