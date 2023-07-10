const childProcess = require("child_process");
const path = require("path");

// directory is defined by the javascript environment variable
const directory = __dirname;
// this is the route to the main directory where the sever is located (without the middleware subroute)
const mainDirectory = directory.substring(0, directory.length - 11);
// path to where the pip is located in the python virtual environment for 3.8
const pathToPip38 = path.join(mainDirectory, "venv-3.8", "bin", "pip3.8");

function installPythonPackageTest38(packageName) {
    try {
        // path to pip defined by the user is the command of the child process
        let childProcessInstallPackage38 = childProcess.spawnSync(process.env.PATH_TO_PIP38 || pathToPip38, ["install", packageName]);

        // return the output and the error returned by the child process 
        return {
            installOutput: String(childProcessInstallPackage38.stdout),
            installError: String(childProcessInstallPackage38.stderr),
        };
    } catch (error) {
        // any errors occur with the function they are caught an an error message is returned by the function - error message could help the user diagnose the problem
        return "This package could not be installed on this python version. This could be due to an incompatibility issue or this package does not exist";
    }
}

module.exports = installPythonPackageTest38;