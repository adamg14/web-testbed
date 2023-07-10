const childProcess = require("child_process");
const path = require("path");

const directory = __dirname;
// this is the route to the main directory where the sever is located (without the middleware subroute)
const mainDirectory = directory.substring(0, directory.length - 11);
// path to where the pip is located in the python virtual environment for 3.9
const pathToPip39 = path.join(mainDirectory, "venv-3.9", "bin", "pip3.9");

async function installPythonPackage39(packageName){
    try {
        // path to pip defined by the user is the command of the child process
        let childProcessInstallPackage39 = childProcess.spawnSync(process.env.PATH_TO_PIP39 || pathToPip39, ["install", packageName]);
        // return the output and the error returned by the child process 
        return {
            installOutput: String(childProcessInstallPackage39.stdout),
            installError: String(childProcessInstallPackage39.stderr)
        };
    } catch (error) {
        // any errors occur with the function they are caught an an error message is returned by the function - error message could help the user diagnose the problem
        return "This package could not be installed on this python version. This could be due to an incompatibility issue or this package does not exist";
    }
}

module.exports = installPythonPackage39;