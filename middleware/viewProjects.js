const project = require("../models/project");

// the purpose of this function in the application is to allow the staff member to view the projects that they have made
// there is a staffId parameter in this function, the argument to this paramater in the application is the staffId stored in the session object on the server which stores information about the current logged in user
async function viewProjects(staffId){
    try {
        // the function sends a query to return all the projects that have the staffId value field equal to the staffId passed into the function(all the projects that the member of staff passed created)
        let staffProjects = project.find({staffId: staffId});
        // the array of projects that belong to the member of staff is then returned by the function
        return staffProjects;
    } catch (error) {
        // if any error occurs with the function while sending this database query an error message is returned by the function.
        return "unexpected error";
    }
};

module.exports = viewProjects;
