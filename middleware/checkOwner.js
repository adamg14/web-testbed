const project = require("../models/project");

// the purpose of this function is to check that the staffId is stored in the corresponding project object - with projectId and staffId     
// this function is used in the application to verify that the logged in member of staff has access rights to the project that it is trying to run commands on
// returns true if the staff has access rights
async function checkOwner(projectId, staffId){
    try {
        // this function does two things at once - it checks if the project exists and then checks if the passed in staff is the owner of the project
        let selectedProject = await project.findOne({projectId: projectId});
        if (selectedProject === null){
            // if the project does not exist - return false
            return false;
        }else if(selectedProject.staffId === staffId){
            // the staff that is passed in is the owner of the project then the function return true
            return true;
        }else{
            // the staff is not the creator of the project
            return false;
        }
    } catch (error) {
        // if there is any error with accessing the database return the string "database error"
        return "database error";
    }
}

module.exports = checkOwner;
