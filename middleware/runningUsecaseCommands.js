const runPythonCode = require("./runPythonCode");
const runJavaCode = require("./runJavaCode");
const path = require("path");

function handlingCommands(project, usecase, copyPath, command){
    try {
        // split the command into arguments by the spaces
        let commandArray = command.split(" ");
        // console.log("THIS IS THE ORIGINAL COMMAND ARRAY " + commandArray);
        // for each argument in the command
        for (let i = 0; i < commandArray.length; i++){
            console.log(commandArray[i]);
            // if the command is the python/java being run 
            if(commandArray[i].includes(".py") || commandArray[i].includes(".java")){
                // remove the parenthesis around the name which tells us it is a file
                let fileName = commandArray[i].substring(1, commandArray[i].length - 1);
                // append the correct path to the name of the file - in a way that is OS independent
                commandArray[i] = path.join(copyPath, usecase.testingFilePath, fileName);

            }else if(commandArray[i].includes`'`){
                // handling other non-programming files
                let fileName = commandArray[i].substring(1, commandArray[i].length - 1);
                commandArray[i] = path.join(copyPath, fileName);
            }
            // other arguments are just plaintext arguments such as -m and unittest etc that dont need any modification
        }

        // remove the first argument of the command as it is always python/java and this value is defined by the server
        commandArray.shift();
        // console.log("THIS IS THE UPDATED COMMAND ARRAY " + commandArray);
        // for (let i = 0; i < commandArray.length; i++){
        //     console.log("THIS SHOULD BE AN ELEMENT " + commandArray[i]);
        // }
        // if the database object of project says that it is a python project - pass the commands and other information about the project to the runPythonCode function or if it is not a python project pass the arguments to the runJavaCode function as that is the only other programming language provided by the application
        if (project.programmingLanguage === ".py"){
            return runPythonCode(commandArray, project.programmingLanguageVersion, usecase, copyPath);
        }else{
            return runJavaCode(project.programmingLanguageVersion, commandArray);
        }
    } catch (error) {
        return "An error has occurred when running the commands on your uploaded file(s). This may be due to the an error in the commands uploaded by the staff for this usecase";
    }
}

function runningUsecaseCommands(selectedProject, selectedUsecase, copyPath){
    try {
        // this array will store the output and/or errors that come with running the code
        let studentOutput = [];

        // for the commands in the selected usecase
        for(let i = 0; i < selectedUsecase.commands.length; i++){
            // pass information about the project and the usecase and the path that the project resides in and thethe single command
            let result = handlingCommands(selectedProject, selectedUsecase, copyPath, selectedUsecase.commands[i]);
            // push the result of running the single command to the studentoutput array
            studentOutput.push(result);
        }
        // this function returns the studentoutput so that it can be rendered to the student on the frontend
        return studentOutput;
    } catch (error) {
        // if any error occurs when handling the function, they will be caught and an error message is returned by the user.
        return "An error has occurred when running the commands on your uploaded file(s). This may be due to the an error in the commands uploaded by the staff for this usecase";
    }
    // for all the commands provided by the usecase 

}

module.exports = runningUsecaseCommands;