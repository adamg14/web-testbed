// https://jojozhuang.github.io/tutorial/running-c-and-java-in-nodejs/
// the compilation of java code cannot be done correctly using spawnsync function - code from the above link is adapted to fit my code: 
// lines: 20-29, 39-47 and 56-65 were adapted
const childProcess = require("child_process");
const directory = __dirname;
const mainDirectory = directory.substring(0, directory.length - 11);
const javacPath14 = mainDirectory + "/jdk-14.0.2.jdk/Contents/Home/bin/javac";
const javacPath17 = mainDirectory + "/jdk-17.0.6.jdk/Contents/Home/bin/javac";
const javacPath19 = mainDirectory + "/jdk-19.0.2.jdk/Contents/Home/bin/javac";

// This function is used in testing to verify that the compilation of java code works.

async function compileJavaCode(javaVersion, javaFilePath){
    try {
        if(javaVersion === "java-14.1"){
            // in the line below which initialised the child process, the shell tag is set to true so the * symbol can be used 
            // an example argument for javaFile path would be code/*.java, for the child process to understand the * symbol the shell tag needs to be set to true
            let javaCompileChildProcess = childProcess.spawn(process.env.PATH_TO_JAVAC14 || javacPath14, [javaFilePath], {shell: true});

            javaCompileChildProcess.stdout.on("data", function(output){
                console.log(output);
            });

            javaCompileChildProcess.stderr.on("data", function(error){
                console.log(error);
            });

            javaCompileChildProcess.on("close", function(data){
                if (data === 0){
                    return true;
                }else{
                    return "compilation error";
                }
            });
        }else if(javaVersion === "java-17.1"){
            let javaCompileChildProcess = childProcess.spawn(process.env.PATH_TO_JAVAC17 || javacPath17, [javaFilePath], {shell: true});

            javaCompileChildProcess.stdout.on("data", function(output){
                console.log(output);
            });

            javaCompileChildProcess.stderr.on("data", function(error){
                console.log(error);
            });

            javaCompileChildProcess.on("close", function(data){
                if (data === 0){
                    return true;
                }else{
                    return "compilation error";
                }
            });
        }else{
            let javaCompileChildProcess = childProcess.spawn(process.env.PATH_TO_JAVAC19 || javacPath19, [javaFilePath]);

            javaCompileChildProcess.stdout.on("data", function(output){
                console.log(output);
            });

            javaCompileChildProcess.stderr.on("data", function(error){
                console.log(error);
            });

            javaCompileChildProcess.on("close", function(data){
                if (data === 0){
                    return true;
                }else{
                    return "compilation error";
                }
            });
        }
    } catch (error) {
        
    }
}

// compile the given java source file and execute it.

module.exports = compileJavaCode;

