const project = require("../models/project");

// this function edits the project by sending an updated query to the database
// this is required by the application to give the member of staff an option to update the project that they have added to the application
async function editProject(projectId, projectName, projectDescription, programmingLanguage, programmingLanguageVersion, numberOffiles, namingConvention){
    try {
        // split the file names of the naming convention to an array of names, the staff is told that the | character is used to split the different file names
        let namingConventionArray = namingConvention.split("|");

        // the function then sends a query to update the project document in the database which has the projectId that matches the argument to the function. The document is then updated with the parameters which have been defined by the staff on the frontend. The function waits for this query to be carried out.
        let updateProject = await project.findOneAndUpdate({projectId: projectId}, {
            projectName: projectName,
            projectDescription: projectDescription,
            programmingLanguage: programmingLanguage,
            programmingLanguageVersion: programmingLanguageVersion,
            numberOffiles, numberOffiles,
            namingConvention: namingConventionArray
        });
        // the function then sends a query to the database to find the updated project document and the function returns the updated project
        let updatedProject = await project.findOne({projectId: projectId});
        return updatedProject;
    } catch (error) {
        // any errors are caught and this message is returned by the function.
        return "unexpected error occured";
    }
}

module.exports = editProject;