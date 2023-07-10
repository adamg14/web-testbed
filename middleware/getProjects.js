const project = require("../models/project");

// this function is used to get all the projects from the database- used to allow the student to select a project that they want to run their code against
async function getProjects(){
    try {
        // query sent to return an array of all the documents from the project collection in the database
        let projects = await project.find();
        // result of the query is returned by the function
        return projects;
    } catch (error) {
        // if an error occurs with sending this request, the function returns this string 
        return "error"
    }
}

module.exports = getProjects;