// COMPILING JAVA HAS TO BE DONE USING SPAWN INSTEAD OF SPAWN SYNC BEFORE THE JAVA FILES CAN BE RUN
// CODE ADAPTED FROM THIS ARTICLE FOR THIS PROCESS TO HAPPEN 
// https://jojozhuang.github.io/tutorial/running-c-and-java-in-nodejs/
// lines 69 - 77, 91 - 99, 113 - 123 adapted from this tutorial to fit in this code
const puid = require("puid");
const fs = require("fs");
const fse = require("fs-extra");
const getUsecase = require("./getUsecase");
const getProject = require("./getProject");
const moveStudentFiles = require("./moveStudentFiles");
const runningUsecaseCommands = require("./runningUsecaseCommands");
const childProcess = require("child_process");
const path = require("path")
// the path to the directory that this file recides in, this file recides in the middleware sub-directory
const directory = __dirname;
// the directory without the middleware sub-directory
const mainDirectory = directory.substring(0, directory.length - 11);

// defining the paths to the javac files for java version 14, 17 and 19. To compile the the java files
const javacPath14 = path.join(mainDirectory, "jdk-14.0.2.jdk", "Contents", "Home", "bin", "javac");
const javacPath17 = path.join(mainDirectory, "jdk-17.0.6.jdk", "Contents", "Home", "bin", "javac");
const javacPath19 = path.join(mainDirectory, "jdk-19.0.2.jdk", "Contents", "Home", "bin", "javac");


// ADD ERROR HANDLING ON THIS FUNCTION TO THE RETURN OF THE GET USECASE AND GET PROJECT FUNCTION
function studentOutput(request, response){
    try {
        // firstly get information about the project and the usecase from the database
        getUsecase(request.body.project, request.body.usecase).then(function(selectedUsecase){
            // RENDER THE CORRECT ERROR MESSAGES
            getProject(request.body.project).then(function(selectedProject){
                // generate a primary key to concatenate to the end of the copy of the project directory
                let PUID = new puid();
                let primarykey = PUID.generate();
                console.log("this should be a primary key " + primarykey);

                // the name of the copy directory of the copy directory is the name of the directory with a primary key concatenated to the end
                let copyPath = selectedUsecase.originalFolderPath + primarykey;
                // copy the content of the project directory into the copy directory (the path of the project directory is defined in the original folder path field of the usecase collection)
                fse.copySync(selectedUsecase.originalFolderPath, copyPath);

                // call the moveStudentFiles function, to move the student files into the copy of the project directory, the code should be moved to the subdirectory where the code should reside. The name of this sub-directory is stored in the testFilePath field in the usecase database schema
                moveStudentFiles(request.files, copyPath, selectedUsecase, selectedProject.namingConvention).then(function(moveStudentFileResult)
                {
                    // once the student files have been moved successfully
                    if (moveStudentFileResult === true){
                        // if the moveStudentFile function returns true, this means that the student file has been successfully moved to copy project directory
                        // set a timeout to allow the files to be moved to the correct directory (this is a time consuming process).
                        setTimeout(function(){
                            if (selectedProject.programmingLanguage === ".py"){
                                // run the files against the commands defined in the usecase
                                let pythonResult = runningUsecaseCommands(selectedProject, selectedUsecase, copyPath);
                                // render the output of the commands run on the student files to the front end for the student to see
                                response.status(200).render("student-output", {studentOutput: pythonResult});
                                // once the commands have been run on the files, remove the copy directory that stores the student files - as requested by the client
                                fse.remove(copyPath, function(error){
                                    if(error){
                                        console.log("error with deleting the student files");
                                    }
                                })
                            }else{
                                // if the project is a java project, the java files need to be compiled before they are run
                                // the path below is the subdirectory of the project where the code resides. The path below defines all the files with the .java extention which need to be compiled before the commands can be run(by using the *.java wildcard)
                                let javaFilesPath = path.join(copyPath, selectedUsecase.testingFilePath, "*.java");

                                if (selectedProject.programmingLanguageVersion === "java-14.1"){
                                    // if the java version of the project is 14 - compile the using the path to the javac (version 14) defined by the user through an environment variable or the predefined path to the preinstalled java jdk - to compile all the java files within the subdirectory (the path to this subdirectory defined in the javaFilesPath above)
                                    // set the shell option to true so that the * wildcare in the javaFilesPath variables can be used
                                    let javaCompileChildProcess = childProcess.spawn(process.env.PATH_TO_JAVAC14 || javacPath14, [javaFilesPath], {shell: true});
                                    javaCompileChildProcess.stdout.on("data", function(output){
                                        console.log("this is the output stream of compiling the java files " + String(output));
                                    });

                                    javaCompileChildProcess.stderr.on("data", function(error){
                                        console.log("this is the output stream of compiling the java output " + String(error));
                                    });

                                    javaCompileChildProcess.on("close", function(){
                                        // once the files have been compiled run the commands on the compiled java code and render the result to the user on the front end
                                        let javaResult = runningUsecaseCommands(selectedProject, selectedUsecase, copyPath);
                                        response.status(200).render("student-output", {studentOutput: javaResult});
                                        // once the commands have been run, delete the copy directory where the student files resided
                                        fse.remove(copyPath, function(error){
                                            if(error){
                                                console.log("error with removing the student files")
                                            }
                                        });
                                    });
                                }else if(selectedProject.programmingLanguageVersion === "java-17.1"){
                                    // if the java version is 17 do the same as 14 but define the path to the javac file in version java 17 environment variable or the path to the javac file for the jdk in the version java 17
                                    let javaCompileChildProcess = childProcess.spawn(process.env.PATH_TO_JAVAC17 || javacPath17, [javaFilesPath], {shell: true});
                                    javaCompileChildProcess.stdout.on("data", function(output){
                                        console.log("this is the output stream of compiling the java files " + String(output));
                                    });

                                    javaCompileChildProcess.stderr.on("data", function(error){
                                        console.log("this is the error stream of compiling the java output " + String(error));
                                    });

                                    javaCompileChildProcess.on("close", function(){
                                        // once the files have been compiled run the commands on the compiled java code and render the result to the user on the front-end
                                        let javaResult = runningUsecaseCommands(selectedProject, selectedUsecase, copyPath);
                                        response.status(200).render("student-output", { studentOutput: javaResult });
                                        // once the commands have been run, delete the copy directory where the student files resided
                                        fse.remove(copyPath, function(error){
                                            if(error){
                                                console.log("error with removing the student files")
                                            }
                                        });
                                    });
                                }else{
                                    // if the java version is 19 do the same as 14 and 17 above but define the path to the javac file in version java 19 environment variable or the path to the javac file for the jdk in the version java 19
                                    let javaCompileChildProcess = childProcess.spawn(process.env.PATH_TO_JAVAC19 || javacPath19, [javaFilesPath], {shell: true});
                                    
                                    javaCompileChildProcess.stdout.on("data", function(output){
                                        console.log("this is the output stream of compiling the java files " + String(output));
                                    });

                                    javaCompileChildProcess.stderr.on("data", function(error){
                                        console.log("this is the output stream of compiling the java output " + String(error));
                                    });

                                    javaCompileChildProcess.on("close", function(){
                                        // once the files have been compiled run the commands on the compiled java code and render the result to the user on the front-end
                                        let javaResult = runningUsecaseCommands(selectedProject, selectedUsecase, copyPath);
                                        response.status(200).render("student-output", { studentOutput: javaResult });
                                        // once the commands have been run, delete the copy directory where the student files resided
                                        fse.remove(copyPath, function(error){
                                            if(error){
                                                console.log("error with removing the student files")
                                            }
                                        });
                                    });
                                }
                            }
                        }, 10000);
                    }else{
                        // if there is an error with moving the student files - a failure page is rendered to the user prompting them to try again
                        response.status(500).render("failure", {failureMessage: "An error occurred in moving your files. Please try again.", link: "/student/projects", linkName: "Back to Home"});
                    }
                });
            });
        });

        // REMEMEBER THAT ONCE THE FILES HAVE BEEN RUN I CAN DELETE THE DIRECTORY SO THAT THE USER FILES DOES NOT PERSIST ON THE SYSTEM
    } catch (error) {
        console.log(error);
        response.status(400).render("failure", {failureMessage: "An error has occurred. Please try again later", link:"/staff-dashboard", linkName: "Staff Dashboard"});
    }
}

module.exports = studentOutput;