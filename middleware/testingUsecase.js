const project = require("../models/project");
const usecase = require("../models/usecase");
const getUsecase = require("./getUsecase");
const getProject = require("./getProject");

// might need it to be an async function
async function testingUsecase(request, response, projectId, usecaseId){
    try {
        // get data on the selected project from the database
        getProject(projectId).then(function(projectResult){
            // if the project that the user wants to access does not exist render this error to the user
            if (projectResult === "error - project does not exist"){
                response.status(404).render("failure", {failureMessage: "This project does not exist.", link:"/", linkName:"Back to Home"});
            }else if(projectResult === "database error"){
                // Error handling - if an error occurred in the duration of the database query notify this error to the user and prompt them to try again as this error was not down to their actions.
                response.status(500).render("failure", {failureMessage: "Database error. Try again later.", link: "/", linkName: "Back to Home"});
            }else{
                // the project is now returned validly, check if the usecase is valid by finding it in the database
                getUsecase(projectId, usecaseId).then(function(usecaseResult){
                    // if the project does not exist (there is a rare caseit may have been deleted while the student ). This if statement handles the rare occasion/error where this error could occur.
                    if (usecaseResult === "error - project does not exist"){
                        response.status(404).render("failure", {failureMessage: "Project does not exist.", link: "/", linkName: "Back to Home"});
                    }else if (usecaseResult === "error - usecase does not exist"){
                        // if the usecase does not exist, display this to the user through a failure warning page
                        response.status(404).render("failure", {failureMessage: "Usecase does not exist", link:"/", linkName: "Back to Home"});
                    }else if (usecaseResult === "database error"){
                        // if an error occurs with the database prompt them to try again as this error is due to the application. 
                        response.status(500).render("failure", {failureMessage: "Database error. Try again later.", link:"/", linkName: "Back to Home"});
                    }else{
                        // if the project and the usecase are both valid. let the student upload their files

                        // the ejs page is rendered with the programmingLanguage to put a restriction on the extention of files that the user can upload (if the programming language of the project is python the user can only upload files with the .py extention, if the programming language of the project is java the user can only upload files that have the extention of .java)
                        let programmingLanguage = projectResult.programmingLanguage;
                        // the number of files of the project is also needed to render the page where the student uploads their code, this number dictates how many file upload entries that the user sees on their page
                        let numberOfFiles = projectResult.numberOfFiles;

                        response.render("student-upload", {numberOfFiles: numberOfFiles, extention: programmingLanguage, selectedProject: request.params.projectId, selectedUsecase: request.params.usecaseId, namingConvention: projectResult.namingConvention});
                    }
                });
            }
        });
    } catch (error) {
        // if any errors occur during the execution of this middleware function they are caught using this try catch loop and a failure page is rendered to the user
        response.status(400).render("failure", {failureMessage: "An unexpected error occurred. Try Again.", link: "/", linkName: "Back to Home"});
    }
}

module.exports = testingUsecase;