const childProcess = require("child_process");
const path = require("path");

const directory = __dirname;
// this is the route to the main directory where the sever is located (without the middleware subroute)
const mainDirectory = directory.substring(0, directory.length - 11);
// path to where the pip is located in the python virtual environment for 3.10
const pathToPip310 = path.join(mainDirectory, "venv-3.10", "bin", "pip3.10");

async function installPythonPackage310(packageName){
    try {
        // path to pip defined by the user is the command of the child process
        let childProcessInstallPackage310 = childProcess.spawnSync(process.env.PATH_TO_PIP310 || pathToPip310, ["install", packageName]);
        // return the output and the error returned by the child process 
        return {
            installOutput: String(childProcessInstallPackage310.stdout),
            installError: String(childProcessInstallPackage310.stderr)
        };
    } catch (error) {
        return "This package could not be installed on this python version. This could be due to an incompatibility issue or this package does not exist";
    }
}

module.exports = installPythonPackage310;