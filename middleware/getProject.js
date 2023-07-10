const project = require("../models/project");

// this function gets the details of a project from the database - used to render information on the frontend to the user and used by the server to get information such as the naming convention of student uploaded files.
async function getProject(projectId){
    try {
        // function sends a query to the database for a document with the projectId that is passed into the function
        let selectedProject = await project.findOne({projectId: projectId});
        if (selectedProject === null){
            // if the query returns null the project does not exists and this is returned by the function
            return "error - project does not exist";
        }else{
            // else the project object which contains the properties of the project is returned by the function
            return selectedProject;
        }
    } catch (error) {
        // if any errors occur when sending this query an error message is returned by the database
        return "database error";
    }
}

module.exports = getProject;