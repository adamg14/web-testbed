const childProcess = require("child_process");
const path = require("path");

// need this to be a environment variable as the path to where the python virtual environment is stored
const directory = __dirname;
const mainDirectory = directory.substring(0, directory.length - 11);
// main directory = /Users/adam/Documents/new-upload
 
// const python38 = mainDirectory + "/venv-3.8/bin/python3.8";
// const python39 = mainDirectory + "/venv-3.9/bin/python3.9";
// const python310 = mainDirectory + "/venv-3.10/bin/python3.10";

const python38 = path.join(mainDirectory, "venv-3.8", "bin", "python3.8");
const python39 = path.join(mainDirectory, "venv-3.9", "bin", "python3.9");
const python310 = path.join(mainDirectory, "venv-3.10", "bin", "python3.10");


function runPythonCode(arguments, programmingLanguageVersion, usecase, copyPath){
    try {
        if (programmingLanguageVersion === "python-3.8"){
            // filePath is the directory in which the python files reside, important to set this as the cwd in the child process as modules depended on other modules in the same directory
            let filePath = path.join(copyPath, usecase.testingFilePath);
            // the command of the child process is the route to the executable python file - this route depends on the machine the server is running on an the version of python selected
            let pythonChildProcess = childProcess.spawnSync(process.env.PATH_TO_PYTHON38 || python38, arguments, {shell: true, cwd: filePath});

            // the function returns the output and error from the child process
            return {
                output: String(pythonChildProcess.stdout),
                error: String(pythonChildProcess.stderr)
            };
            // repeated process for the other version of python
        }else if(programmingLanguageVersion === "python-3.9"){
            let filePath = path.join(copyPath, usecase.testingFilePath);
            let pythonChildProcess = childProcess.spawnSync(process.env.PATH_TO_PYTHON39 || python39, arguments, {shell: true, cwd: filePath});
            return {
                output: String(pythonChildProcess.stdout),
                error: String(pythonChildProcess.stderr)
            };
        }else{
            let pythonChildProcess = childProcess.spawnSync(process.env.PATH_TO_PYTHON310 || python310, arguments, {shell: true, cwd});

            return {
                output: String(pythonChildProcess.stdout),
                error: String(pythonChildProcess.stderr)
            };
        }
    } catch (error) {
        // console.log(error);
        // if any errors occur within the function they are caught and an error message is returned by the function
        return "An unexpected error occurred when executing the file";
    }
}

module.exports = runPythonCode;