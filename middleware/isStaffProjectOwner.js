const staff = require("../models/staff");
const project = require("../models/project");
const getProject = require("./getProject");


async function isStaffProjectOwner(projectId, staffId){
    try {
        getProject(projectId).then(function(requestedProject){
            if (requestedProject === "error - project does not exist"){
                return "project doesn't exist"
            }else if(requestedProject === "database error"){
                return 
            }else if(requestedProject.staffId !== staffId){
                return false
            }else{
                return true;
            }
        });
    } catch (error) {
        return "unexpected error occurred."; 
    }
}

module.exports = isStaffProjectOwner;