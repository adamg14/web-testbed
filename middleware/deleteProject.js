const project = require("../models/project");
const fse = require("fs-extra");
const path = require("path");

// using the javascript environment variable which specifies the directory that this file resides in
let directory = __dirname;
// the main directory of the server without the middleware subdirectory
let mainDirectory = directory.substring(0, directory.length - 11);

// the function deletes a project both from the database and from the project files. This function is called during the web application on the request of the member of staff
async function deleteProject(projectId){
    try {
        // this query finds the project in the database
        let foundProject = await project.findOne({projectId: projectId});

        if (foundProject === null){
            // if the project does not exist - return the string "project does not exist"
            return "project does not exist";
        }else{
            // the path of the project written in a way that is OS independent
            let projectPath = path.join(mainDirectory, "projects", projectId);
            // let projectPath = mainDirectory + "/projects/" + projectId;
            
            // removes the project file from the server - file handling which deletes the project directory done using the fs-extra NPM module
            fse.removeSync(projectPath);

            // the function carries out the database query that will delete the project document with the corresponding projectId from the database
            let deletedProject = await project.findOneAndDelete({projectId: projectId});
            // once the query is complete the function returns the string "project deleted"
            return "project deleted";
        }
    } catch (error) {
        // if any unexpected error occurs during the function or during the queries made to the back-end database queries the function catches this error and this string is returned by the function
        return "An unexpected error has occurred.";
    }
}

module.exports = deleteProject;
