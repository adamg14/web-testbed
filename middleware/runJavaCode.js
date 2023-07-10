const childProcess = require("child_process");
const path = require("path");

// path of the directory that this file resides in
const directory = __dirname;
// the directory of the server without the middleware subdirectory
const mainDirectory = directory.substring(0, directory.length - 11);

// path of the directories in which the java path reside written in a way that is OS dependent
const javaPath14 = path.join(mainDirectory, "jdk-14.0.2.jdk", "Contents", "Home", "bin", "java");
const javaPath17 = path.join(mainDirectory, "jdk-17.0.6.jdk", "Contents", "Home", "bin", "java");
const javaPath19 =  path.join(mainDirectory, "jdk-19.0.2.jdk", "Contents", "Home", "bin", "java");
// const javaPath14 = mainDirectory + "/jdk-14.0.2.jdk/Contents/Home/bin/java";
// const javaPath17 = mainDirectory + "/jdk-17.0.6.jdk/Contents/Home/bin/java";
// const javaPath19 = mainDirectory + "/jdk-19.0.2.jdk/Contents/Home/bin/java";


function runJavaCode(javaVersion, commandArguments){
    try {
        // the command for the child process is the path to the java executable file - this depends on the version of java being used
        if (javaVersion === "java-14.1"){
            // the commandArguments array argument is being passed into the child process
            let javaRunChildProcess = childProcess.spawnSync(process.env.PATH_TO_JAVA14 || javaPath14, commandArguments);
            // the function returns the output and the error of the child process
            return {
                output: String(javaRunChildProcess.stdout),
                error: String(javaRunChildProcess.stderr)
            };
        }else if(javaVersion === "java-17.1"){
            let javaRunChildProcess = childProcess.spawnSync(process.env.PATH_TO_JAVA17 || javaPath17, commandArguments);
            return {
                output: String(javaRunChildProcess.stdout),
                error: String(javaRunChildProcess.stderr)
            };
        }else{
            let javaRunChildProcess = childProcess.spawnSync(process.env.PATH_TO_JAVA19 || javaPath19, commandArguments);
            return {
                output: String(javaRunChildProcess.stdout),
                error: String(javaRunChildProcess.stderr)
            };
        }
    } catch (error) {
        // any errors caused by the function will result in an error being passed into the function
        return "An error has occurred when trying to run the java files";
    }
}

module.exports = runJavaCode;