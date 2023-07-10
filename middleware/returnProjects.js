const projects = require("../models/project");

async function returnProjects(){
    
    await projects.find({projectId: {$exists: true}}, function(error, allProjects){
        if (error){
            return error;
        }else if(!allProjects){
            return 'no projects available';
        }else{
            // hopefully this is an array
            return allProjects;
        }
    });
}

module.exports = returnProjects;