const express = require("express");
const ejs = require("ejs");
const expressFileupload = require("express-fileupload");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const puid = require("puid");
const nodemailer = require("nodemailer");
// const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const passwordGenerator = require("generate-password");
const speakeasy = require("speakeasy");
const mongooseSanitise = require("mongo-sanitize");
const dotenv = require("dotenv");
const expressratelimit = require("express-rate-limit");

const staff = require("./models/staff");
const project = require("./models/project");

const addProject = require("./middleware/addProject");
const addUsecase = require("./middleware/addUsecase");
const getProjects = require("./middleware/getProjects");
const getUsecases = require("./middleware/getUsecases");
const testingUsecase = require("./middleware/testingUsecase");
const studentOutput = require("./middleware/studentOutput");
const passwordHashing = require("./middleware/passwordHashing");
const compareHash = require("./middleware/compareHash");
const deleteProject = require("./middleware/deleteProject");
const deleteUsecase = require("./middleware/deleteUsecase");
const deleteAccount = require("./middleware/deleteAccount");
const editProject = require("./middleware/editProject");
const changePassword = require("./middleware/changePassword");
const viewProjects = require("./middleware/viewProjects");
const checkOwner = require("./middleware/checkOwner");
const getProject = require("./middleware/getProject");
const createAccount = require("./middleware/createAccount");
const installPythonPackage38 = require("./middleware/installPythonPackage38");
const installPythonPackage39 = require("./middleware/installPythonPackage39");
const installPythonPackage310 = require("./middleware/installPythonPackage310");
const sanitiseInput = require("./middleware/sanitiseInput");
const { rateLimit } = require("express-rate-limit");


const app = express();

// setting up the environment variables, so that the environment variables defined in the file can be used in the file. Environment variables are needed to keep the user defined variables and secrets (Any passwords and environment variables) away from code. 
dotenv.config();

// setting the view engine to ejs
// view engine looks inside views subdirectory for the files to render, with dynamic data, on the frontend to the user of the web application
app.set("view engine", "ejs");

// Telling the web application to use express-file upload. Important for both student and staff file uploads, when a form is sent to the server via an HTTP POST request, the files uploaded will be sent to the server in the request.files object.
app.use(expressFileupload());

// body-parser is used to for the server to be able to understand the information sent in the body of a HTTP POST request. Which is vital for all information sent by the user via a HTML form in an HTTP POST request, for the server to render this information
app.use(bodyParser.urlencoded({ extended: true }));

// since the app is using the view engine ejs, which handles dynamic pages, the static files needed for the projects() stored in the folder public. The following line tells the express application that these files are located in the public subdirectory.
app.use(express.static("public"));

// the web application uses cookies, which are stored on the frontend which contain the sessionID for the corresponding session which is stored on the server which contains information about the user such as the email and the staffId of the member of staff which is logged in.
// app.use(cookieParser());

// this express web app uses 'express-session' to implement sessions, which stores information (email and staffId) about the logged in member of staff on the server
app.use(expressSession({
    // the secret key which is stored in the .env file which is used to sign the cookies
    secret: process.env.SECRET_KEY,
    cookie: {
        httpOnly: true,
        // secure being true will mean that only requests being made using HTTPS are accepted
        secure: false,
        // the cookie expires after 10 minutes. This is best practice to avoid attacks such as cookie stealing through XSS. The user is automatically logged out after 10 minutes, which saves from any vulnerability which may occur if the user forgets to logout.
        maxAge: 600000
    }
}));


// this web application uses 'express-rate-limit' npm package to put a limit on the number of requests a single IP address at a given time. This is implemented to reduce the effects/chances of a bot attack (DOS and DDOS). Where one or more malicious machines send a large number of requests to overwhelm the server and deny real users of resources.

// Code to set up the parameters for a rate limit adapted from the official docs
// https://www.npmjs.com/package/express-rate-limit
// lines 82 - 88
const limiter = expressratelimit.rateLimit({
    // 10 minute window
    windowMs: 10 * 60 * 1000,
    // a single IP can make 50 requests in a single window. Max API calls is an estimate based on the standard use of the application
    max: 50,
    standardHeaders: true,
    legacyHeaders: false
});

// the rate limit is applied to all API endpoints on the server to mitigate DOS and DDOS attacks.
app.use(limiter);

// using the node js mongodb driver, mongoose, to connect to the mongodb database, using the database password stored as an environment variable.
mongoose.connect('mongodb+srv://admin:' + process.env.MONGODB_PASSWORD + '@cluster0.sc1aozc.mongodb.net/testbed?retryWrites=true&w=majority');

// function to authenticate the user based on the data stored in the session. Applied to all restricted routes that only staff (logged in users) should have access to. If the user is logged in they will be able to access the restricted route, if the user is not logged in an they try to access the restricted route they will be taken to the login page to be authenticated.
// code within the function adapted from this online tutorial
// https://jonathan-holloway.medium.com/node-and-express-session-a23eb36a052
// lines 103, 104.
function authenticateUser(request, response, next) {
    if (request.session.loggedIn === true) {
        next();
    } else {
        response.status(401).render("login");
    }
}

// The rest of the is code in this file is defining the API routes using express functionality. Handling the request of the user and defining the response that the server sends back to the user.
app.get("/", function (request, response) {
    response.status(200).render("home");
});

app.get("/register", function (request, response) {
    response.render("register");
});

app.post("/register", function (request, response) {
    // email and password input sent to the server by the user via the front-end form in a HTTP POST request.
    let email = String(request.body.staffEmail);
    let password = String(request.body.staffPassword);

    // check the staff collection within the database for the email which was sent to the server by the user.
    staff.findOne({ email: email }, function (error, foundStaff) {
        if (error) {
            // if there is an error in the datbase. An error code of 500 is sent as this is the fault of the database and not the user.
            response.status(500).render("failure", {failureMessage: "An error connecting to the database has occurred. Please try again later.", link: "/register", linkName: "Register"});
        } else {
            if (!foundStaff) {
                // if the email is not in the database. An account will be created by the server, where a staffId will be generated, the password will be hashed and the email are all stored in a .  
                createAccount(email, password).then(function (result) {
                    if (result === "unexpected error occurred") {
                        // Error handling - if an error occurs e.g creating a connection to the database has failed. A failure page will be rendered to the user and they will be prompted to try to register again. 
                        response.status(500).render("failure", { failureMessage: "An unexpected error has occurred. Try again.", link: "/register", linkName: "Register" });
                    } else {
                        // If the account was created without any errors, the staff's credentials will now be stored in the database and they will now be able to login with the credentials. They will then see a success page which will prompt them to login.
                        response.status(200).render("success", { successMessage: "Your account has been registered successfully.", link: "/login", linkName: "Login" });
                    }
                });
            } else {
                // if the email the user tries to register with is already in the database, they will be promted to login.
                response.status(404).render("failure", { failureMessage: "This user already exists. Please login.", link: "/login", linkName: "Login" });
            }
        }
    });
});

app.get("/login", function (request, response) {
    response.render("login");
});

app.post("/login", function (request, response) {
    // credentials that the user sent to the server via the login form
    let email = String(request.body.staffEmail);
    let password = String(request.body.staffPassword);

    // finding a document in the staff collection within the database, where the email matches the email submitted by the user
    staff.findOne({ email: email }, function (error, foundStaff) {
        if (error) {
            // if an error occurs during the database operation e.g a connection error a failure page is rendered to the user and they are prompted to try again
            response.status(500).render("failure", { failureMessage: "Datbase error. Try again later.", link: "/login", linkName: "Back to Login" });
        } else {
            if (!foundStaff) {
                // if the account does not exist. Render this to the user via a failure message
                response.status(400).render("failure", { failureMessage: "User does not exist", link: "/", linkName: "Back to Home" });
            } else {
                // if the account does exist, hash the password sent in the body of the HTTP POST request and compare it to the hash stored in the database for that account.
                if (compareHash(password, foundStaff.password)) {
                    // If the hash of the password submitted matches the hash of the password in the database, save information about the user to the session and begin the second level of authentication for this user.
                    request.session.staffEmail = email;
                    request.session.staffId = foundStaff.staffId;
                    response.status(200).redirect("/2fa");
                } else {
                    // if the password does not match render this as a failure page and prompt the user to login again
                    response.status(400).render("failure", { failureMessage: "Incorrect Password", link: "/login", linkName: "Back to Login" });
                }
            }
        }
    });
});

// route for 2 factor authentication
app.get("/2fa", function (request, response) {
    // generate a secret key using the 'speakeasy' npm package which is often used by web applications to create 2FA codes.
    let secretKey = speakeasy.generateSecret();

    // find the document of the email of the user which is stored in the session from when the user submitted the correct password.
    // update the code2FA field to the secret key generated above. Then send this code to the user by email. The 'nodemailer' npm module is used to send emails the user.
    staff.findOneAndUpdate({ email: request.session.staffEmail }, { code2FA: secretKey.ascii }, function () {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "adamg2609@gmail.com",
                pass: "ijbsnuwsflehmobw"
            }
        });


        let mailOptions = {
            from: "adamg2609@gmail.com",
            // CHANGE THIS EMAIL TO THE EMAIL STORED IN THE DATABASE
            to: request.session.staffEmail,
            subject: "2FA Code",
            text: secretKey.ascii
        };

        // once the email is sent render the page where the user can enter the code which was sent to their email.
        transporter.sendMail(mailOptions, function (error, info) {
            {
                if (error) {
                    response.status(400).send("error with the email being sent");
                } else {
                    response.render("2fa");
                }
            }
        });
    });
});

// Once the user sends the 2FA code via a HTTP POST request via the form on the get /2FA route
app.post("/2fa", function (request, response) {
    // find the document of the user who is trying to login, using the email stored in the session
    staff.findOne({ email: request.session.staffEmail }, function (error, foundStaff) {
        if (error) {
            response.status(500).render("failure", { failureMessage: "Error with the database", link: "/", linkName: "Back to Home" });
        } else if (!foundStaff) {
            response.status(404).render("failure", { failureMessage: "User does not exist", link: "/", linkName: "Back to Home" });
        }
        else {
            let stringStaffCode = String(request.body.staffCode);

            // if the code submitted by the user matches the code stored in the session
            if (foundStaff.code2FA === stringStaffCode) {
                request.session.loggedIn = true;
                response.status(200).redirect("/staff-dashboard");
            } else {
                // if the 2FA code submitted by the user does not match the code stored in the database, render a failure page to the user, remove the information about the user in the session
                request.session.destroy();
                response.status(400).render("failure", { failureMessage: "2FA code you have entered does not match.", link: "/", linkName: "Back to Home" });
            }
        }
    });
});

// The /logout route allows logged in users to end their session, all their data will be removed from the session and the user will be logged out and they will be redirected to the home route
app.get("/logout", authenticateUser, function (request, response) {
    request.session.destroy();
    response.redirect("/");
});

// If the user has forgotten their password, allow the user to enter their email and a new password is sent to their email which they can use to log in and change their password once they are logged in.
app.get("/forgotten-password", function (request, response) {
    response.render("forgotten-password");
});


app.post("/forgotten-password", function (request, response) {
    let stringStaffEmail = String(request.body.staffEmail);

    // sanitise the input email that the user submits to avoid any database injection attack.
    let sanitisedStaffEmail = mongooseSanitise(stringStaffEmail);
    // check that the user has an account
    staff.findOne({ email: sanitisedStaffEmail }, function (error, foundStaff) {
        if (error) {
            // if there is an error when executing the database query render this to the front end
            response.status(400).render("failure", { failureMessage: "An error occurred with accessing the database" });
        } else {
            if (!foundStaff) {
                // if the user does not have an account
                response.status(400).render("failure", { failureMessage: "This account does not exist.", link: "/", linkName: "Back to Home" });
            } else {
                // generate a new password for the user
                let newPassword = passwordGenerator.generate({
                    length: 20,
                    numbers: true
                });
                
                // hash this password
                let hash = passwordHashing(newPassword);

                // update the user's staff document to store the hash of the new password in the password field
                staff.findOneAndUpdate({ email: sanitisedStaffEmail }, { password: hash }, function () {
                    let transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "adamg2609@gmail.com",
                            pass: "ijbsnuwsflehmobw"
                        }
                    });

                    let mailOptions = {
                        from: "adamg2609@gmail.com",
                        // NEED TO CHANGE THIS ONCE IT WORKS
                        to: String(request.body.staffEmail),
                        subject: "New Password",
                        text: newPassword
                    };

                    // email the new password to the staff's email so that they can log in with it
                    transporter.sendMail(mailOptions, function (error, info) {
                        {
                            if (error) {
                                response.status(400).render("failure", { failureMessage: "Email failed to send.", link: "/login", linkName: "Back to Login Page" });
                            } else {
                                response.status(200).render("success", { successMessage: "Email sent with new password. This may take a few minutes.", link: "/login", linkName: "Login" });
                            }
                        }
                    });
                });
            }
        }
    });
});

// the staff dashboard where they can access all their functionality
app.get("/staff-dashboard", authenticateUser, function (request, response) {
    response.render("staff-dashboard");
});


app.get("/staff-home", function (request, response) {
    response.render("staff-home");
});

// the routes where the students can view the projects
app.get("/student/projects", function (request, response) {
    getProjects().then(function (result) {
        // The following if statements are error handling on the return of the getProjects function which executes the database query which returns all the project from the database so that the student can view them on the front-end
        if (result === "error") {
            // if the function returns the string "error", meaning that an error has occurred during the execution of the database query a failure page is rendered to the user prompting them back to the home page to try again.
            response.status(500).render("failure", { failureMessage: "Database Error. Please try again.", link: "/", linkName: "Back to Home" });
        } else {
            // If the response of the function getProjects is anything other than "error", the database query ran by the function has been successfully executed. The projects ejs file will be rendered to the user displaying all the project for the student to select one.
            response.status(200).render("projects", { Projects: result });
        }
    }).catch(function (error) {
        // if any unexpected errors occur when running the function an failure message will be shown to the user.
        response.render("failure", { failureMessage: "Unexpected Error", link: "/", linkName: "Back to Home" });
    });
});

// the sub-route of projects where - this filters the project so that only the python projects appear
app.get("/student/projects/python", function (request, response) {
    try {
        // A database query is done on the project collection, so that all the projects with the the value ".py" on the programming language fields are shown to the user
        project.find({ programmingLanguage: ".py" }).then(function (pythonProjects) {
            response.status(200).render("projects", { Projects: pythonProjects });
        });
    } catch (error) {
        // Error handling - if any error occurs when making executing this query on the database this is caught by the server and a failure page is rendered to the user prompting them to go back to the project route
        // 500 status code because the error is down to the application and not the user
        response.status(500).render("failure", { failureMessage: "An error occurred when retrieving python projects. Please try again.", link: "/student/projects", linkName: "Back to Projects" });
    }
});

// the sub-route of projects where all the java projects are rendered to the user- this filters the project so that only the python projects appear
app.get("/student/projects/java", function (request, response) {
    try {
        // a database query which returns all the java projects, by filtering on the programming language field of the project collectoins
        project.find({ programmingLanguage: ".java" }).then(function (pythonProjects) {
            // 200 status code returned because the database query was successfully executed.
            response.status(200).render("projects", { Projects: pythonProjects });
        });
    } catch (error) {
        // if an error occurs when executing the database query such as an error in the connection to the database an error page is rendered to the user of the application
        response.status(500).render("failure", { failureMessage: "An error occurred when retrieving python projects. Please try again.", link: "/student/projects", linkName: "Back to Projects" });
    }
});

// this route orders the project is descending order of date
app.get("/student/projects/datedesc", function (request, response) {
    try {
        // this database query finds all the projects then sorts all the projects in descending order of date (the dateAdded field)
        project.find().sort({ dateAdded: "descending" }).then(function (projectsDateSorted) {
            response.status(200).render("projects", { Projects: projectsDateSorted });
        });
    } catch (error) {
        // if any error occurs in the database query a failure page will be rendered to the user
        response.status(500).render("failure", { failureMessage: "An error occurred when sorting the projects. Please try again.", link: "/student/projects", linkName: "Back to Projects" });
    }
});

// this route orders the project is descending order of date
app.get("/student/projects/dateasc", function (request, response) {
    try {
        // the database query finds all the projects and sorts them in ascending order of the dateAdded field
        project.find().sort({ dateAdded: "ascending" }).then(function (projectsDateSorted) {
            response.render("projects", { Projects: projectsDateSorted });
        });
    } catch (error) {
        response.render("failure", { failureMessage: "An error occurred when sorting the projects. Please try again.", link: "/student/projects", linkName: "Back to Projects" });
    }
});

// the route where staff uploads their projects and a usecase for the corresponding project
app.get("/projects/new", authenticateUser, function (request, response) {
    // ADD AUTHENTICATE USER
    response.render("staff-upload");
});

app.post("/projects/new", authenticateUser, function (request, response) {
    // primary keys generated for the project and usecase using the PUID npm package, which is date-time dependendent therefore the primary keys will be unique
    const PUID = new puid();
    let generateProjectId = PUID.generate();
    let usecaseId = PUID.generate();

    // the data uploaded by the staff via the front-end form through a HTTP POST request about the project
    let projectId = generateProjectId;
    let projectName = request.body.projectName;
    let projectDescription = request.body.projectDescription;
    let programmingLanguage = request.body.programmingLanguage;
    let numberOfFiles = request.body.numberOfFiles;
    let testingFilePath = request.body.testingfilePath;
    let programmingLanguageVersion = request.body.programmingLanguageVersion;
    let namingConvention = request.body.namingConvention;

    // the staffId of the member of staff who added the project, which was added to the session when the staff was authenticated
    let staffId = request.session.staffId;

    // add a new project to the project collection in the database.
    addProject(projectId, projectName, projectDescription, programmingLanguage, programmingLanguageVersion, numberOfFiles, testingFilePath, namingConvention, staffId).then(function (result) {
        if (result === "An error occurred when adding the project.") {
            // if any error
            response.status(500).render("failure", { failureMessage: "Error occurred in adding the project. This may be an error with connecting to the database. Try again later.", link: "/staff-dashboard", linkName: "Back to Dashboard" });
        } else {
            // once the project has been successfully added to the database(because a project needs to created due to the one to many relationship between project and usecase, one project can have many usecases) the addUsecase middleware function is called which will handle the files uploaded by the member of staff and return a response to the user depending on the result
            addUsecase(request, response, projectId, usecaseId);
        }
    });

});

// once the student selects a project through a POST request where in the body of this request the projectId of the project is sent, the student is redirected to the project page where they can select a usecase they wish to be tested against.
app.post("/student/projects", function (request, response) {
    response.redirect("/student/projects/" + request.body.projectSelected);
});

// the student is redirected to a page where they will be able to upload the required files for this usecase
app.post("/student/projects/usecases", function (request, response) {
    response.redirect("/student/projects/" + request.body.projectId + "/" + request.body.usecaseId);
});

// shows the user the available usecases for a specific project
app.get("/student/projects/:projectId", function (request, response) {
    let sanitiseResult = sanitiseInput(request.params.projectId);
    // since this route has a variable parameter name check that the request parameter is not an SQL attack or a DOM XSS attack
    if (sanitiseResult === "SQL INJECTION DETECTED") {
        response.status(400).render("failure", { failureMessage: "SQL Injection attack attempt detected", link: "/student/projects", linkName: "Back to Student Projects" });
    } else if (sanitiseResult === "XSS ATTEMPT DETECTED") {
        response.status(400).render("failure", { failureMessage: "XSS attack attempt detected.", link: "/student/projects", linkName: "Back to Student Projects" });
    } else {
        // if route contains no potential malicious code get all the usecases that the project has
        getUsecases(request.params.projectId).then(function (getUsecasesResult) {
            // if the projectId in the route does not exist (there are not project documents that have this value in the projectId field) render this to the user 
            if (getUsecasesResult === "error - project does not exist") {
                response.status(404).render("failure", { failureMessage: "The project you have tried to access does not exist.", link: "/student/projects", linkName: "Back to Student Projects" });
            } else if (getUsecasesResult === "error") {
                // if an error occurred during the database query, e.g. the connection to the database was lost, render this to the user and prompt them to try again.
                response.status(500).render("failure", { failureMessage: "An error in connecting the database to retrieve the project has occurred. Please try again.", link: "/student/projects", linkName: "Back to Student Projects" });
            } else {
                // if the database query was executed successfully render the usecases to the student so that they can select one
                response.status(200).render("student-usecases", { usecases: getUsecasesResult, projectId: request.params.projectId });
            }
        });
    }
});

// this route allows to the student to upload the files requried for a specific usecase
app.get("/student/projects/:projectId/:usecaseId", function (request, response) {
    let sanitiseResult1 = sanitiseInput(request.params.projectId);
    let sanitiseResult2 = sanitiseInput(request.params.usecaseId);

    // since there are dynamic paramters in this route (projectId and usecaseId) these must be checked for any malicious code before performing any database query or functionalities with these values
    if (sanitiseResult1 === "SQL INJECTION DETECTED" || sanitiseResult2 === "SQL INJECTION DETECTED") {
        response.status(400).render("failure", { failureMessage: "SQL Injection attempt detected.", link: "/", linkName: "Back to Home" });
    } else if (sanitiseResult2 === "XSS ATTEMPT DETECTED" || sanitiseResult2 === "XSS ATTEMPT DETECTED") {
        response.status(400).render("failure", { failureMessage: "XSS attempt detected.", link: "/", linkName: "Back to Home" });
    } else {
        // if no malicious code was identified in the route call the middleware function that allows the user to upload their files to the specific project and usecase, including the file handling and the response being sent to the user
        testingUsecase(request, response, request.params.projectId, request.params.usecaseId);
    }
});

// the route where the student files are uploaded to
app.post("/studentfiles", function (request, response) {
    // this middleware function handles the users files (creates a copy of the project, moves the student files to this copy of the project directory, runs the commmands aginst these files and displays the result of these commands to the user on the front end to the user, once the results are displayed to the user the copy of the project directory which contained the student files are removed from the server was requested by the client for good security practice as the student files should not permanently reside on the server due to the fact that they may possible contain malicious code.
    studentOutput(request, response);
});

// This route allows the logged in member of staff to view their project, for them to be able to access the functionality that they have over their projects, allowing them to select the project they want to edit/delete:. Through this route they are able to: edit a project, delete a project and delete a usecase
app.get("/staff/projects", authenticateUser,function (request, response) {
    // The viewProjects function returns all the projects, with a filter on the value of the staffId field of the project document. The argument to the function is the staffId of the logged in member of staff which is stored in the session object which was initialised when the staff member authenticated themselves and logged into the function, all the projects with the staffId field that matches the value of this argument will be returned by the function that carries out the database query.
    viewProjects(request.session.staffId).then(function (staffProjects) {
        if (staffProjects === "unexpected error") {
            // if the database query carried out by the function could not be executed for any reason the member of staff will be taken to a failure page where they will be prompted to go back to the staff dashboard and try again.
            response.status(500).render("failure", { failureMessage: "An error has occurred when retrieving the projects from the database. Try again.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
        } else {
            // If "unexpected error" was not returned by the function, the database query executed by the viewProjects function was successfully executed, the projects that are owned by the logged in member of staff will be returned and rendered using the staff-projects.ejs file in the views subdirectory.
            response.status(200).render("staff-projects", { Projects: staffProjects });
        }
    });
});

// When the member of staff selects the project that they want to perform an action, a POST request is sent to this route. In the body of the POST request contains the projectId (primary key ) of the project that they want to access. The user is then redirected to the route which will render the user a page on the actions that they can take on that specific selected project 
app.post("/staff/projects", authenticateUser,function (request, response) {
    // projectId of the project that the user wants to acess, sent by a POST request to this route
    let selectedProject = request.body.projectId;
    // user is redirected to the route where they will see a page that will allow them to perform the actions on the project and its usecases.
    response.status(200).redirect("/staff/projects/" + selectedProject);
});

// This route will give the options of the actions that the staff member can undertake on their project: Delete Project, Edit Project, Delete Usecase.
// home page for a specific project
app.get("/staff/projects/:projectId", authenticateUser,function (request, response) {
    // Since this route has a dynamic route (projectId parameter). The value of projectId in the route must be checked for any malicious code/symbols, as this projectId value will be used to carry out database queries which is an opportunity for a code injection attack or database injection attack.

    // call the sanitiseInput on the projectId request parameters, that will detect any malicious attempts by the user
    let sanitiseResult = sanitiseInput(request.params.projectId);

    if (sanitiseResult === "SQL INJECTION DETECTED") {
        // If symbols synonymous to an SQL injection attack (a valid projectId will not contain any of these symbols) is detected by the sanitiseResult function, this will be displayed to the user and this valid of projectId will not be used by the server as it will risk the security of the web application.
        response.status(400).render("failure", { failureMessage: "SQL injection attempt detected.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    } else if (sanitiseResult === "XSS ATTEMPT DETECTED") {
        // If symnols synonmous to an XSS attack is detected, a failure page. This value will not be used by the server to carry out any database queries for saftey reasons.
        response.status(400).render("failure", { failureMessage: "XSS attempt detected.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    } else {
        // Before giving the staff member access to this route, they are checked if they have ownership over the project that they are trying to perform an action on. For instance a valid, logged in staff member may be trying to access a project that they do not have ownership over (they did not create it) which should not be allowed. checkOwner function is used to determine whether the staff that is logged in created the project and therefore has access to carry out actions on the project, such as edit and delete.
        checkOwner(String(request.params.projectId), String(request.session.staffId)).then(function (checkOwnerResult) {
            // when the projectId of the project needed to be accessed and the staffId of the member of staff logged in are passed into the checkOwner function and this function returns true, the staff has access rights to the route.
            if (checkOwnerResult === true) {
                // if the staff has access rights, the getProject function is called to get information about the project and its usecases from the database
                getProject(request.params.projectId).then(function (getProjectResult) {
                    if (getProjectResult === "database error") {
                        // if the getProject function returns "database error" an error occurred when the function executes the database query. The user is rendered a failure page and the user is prompted back to the staff dashboard to try again
                        response.status(500).render("failure", { failureMessage: "An error has occurred with retrieving the project from the database. Please try again.", link: "/staff-dashboard", linkName: "Back to Staff Dashboard" });
                    } else if (getProjectResult === "error - project does not exist") {
                        // if the getProject function executes the database query to see that the project does not exist (the project is not in the database). An appropriate error message is dislayed to the user and they are prompted to go back to the staff dashboard
                        response.status(404).render("failure", { failureMessage: "This project does not exist.", link: "/staff-dashboard", linkName: "Back to Staff Dashboard" });
                    } else {
                        // if the getProject function doesn't return "database error" or "error - project does not exist" the result of the function will be a project, the staff-project-home.ejs file is then rendered with the project as the result of the getProject function so that the member of staff can see the actions that are available for that specific project. 
                        response.status(200).render("staff-project-home", {Project: getProjectResult});
                    }
                });
            } else if (checkOwnerResult === "database error") {
                // if the checkOwnerResult returns "database error", an error occured when the function was executing the database query to verify if the member of staff has ownership over the project. If this is the case, a failure page with an appropriate error message is rendered to the member of staff and they are prompted to return to the staff dashboard to try again.
                response.status(500).render("failure", { failureMessage: "An error has occured with accessing the database. Please try again later.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
            } else {
                // if the checkOwner function returns anything other than "database error" or true, the return of the function is false, this means that the member of staff does not have authority over the project and they should not be allowed to perform actions on this project
                // If this is the case, a failure page is rendered to the user with an error message telling them that they do not have access rights to this project route.
                response.status(400).render("failure", { failureMessage: "Access denied. You did not create this project", link: "/staff-dashboard", linkName: "Back to Staff Dashboard" });
            }
        });
    }
});

app.post("/staff/projects/add-usecase", authenticateUser,function (request, response) {
    // from the project page, if the user decides to add a usecase to this project, the projectId of the will be sent in the body of a POST request to this route.
    // The projectId, primary key, of the project that the member of staff wants to add which was sent in the body of the POST request.
    let projectId = request.body.projectId;

    // create a usecaseId, primary key, using the PUID npm package for the usecase that will be added to the project document
    let PUID = new puid();
    let usecaseId = PUID.generate();

    // redirect the user to a correct route where they will be able to enter the details and upload files for the usecase that they want to add to the project.
    response.status(200).redirect("/staff/projects/add-usecase/" + projectId + "/" + usecaseId);
});

app.get("/staff/projects/add-usecase/:projectId/:usecaseId", authenticateUser,function (request, response) {
    // since this route contains variable paramters (projectId and usecaseId). This is an opportunity for an attacker to inject into the route, this must be prevented.
    // pass the two route parameter variables into the sanitiseInput function to detect for any code injection attacks
    let sanitisedResult1 = sanitiseInput(request.params.projectId);
    let sanitisedResult2 = sanitiseInput(request.params.usecaseId);

    let postRoute = "/staff/projects/add-usecase/" + request.params.projectId + "/" + request.params.usecaseId;

    if (sanitisedResult1 === "SQL INJECTION DETECTED" || sanitisedResult2 === "SQL INJECTION DETECTED") {
        // if any of projectId or usecaseId contain symbols synonymous to a SQL Injection attack, the server will not use these values and render an error the telling the user that their route contains SQL Injection code
        response.status(400).render("failure", { failureMessage: "SQL Injection attempt detected.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    } else if (sanitisedResult1 === "XSS ATTEMPT DETECTED" || sanitisedResult2 === "XSS ATTEMPT DETECTED") {
        // If an XSS attempt is detected in any of the route values, the values are rejected and user is taken to a failure page
        response.status(400).render("failure", { failureMessage: "XSS attempt detected", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    } else {
        // If the route values do not - check again if the user has authority to access this route and carry out actions on this project by passing in the projectId within the route parameter and the staffId stored in the session
        checkOwner(request.params.projectId, request.session.staffId).then(function (checkOwnerResult) {
            if (checkOwnerResult === false) {
                // if the staff does not have ownership over the project, reject acess to the functionality of the this route: render a failure 
                response.status(404).render("failure", { failureMessage: "Access Denied. Either you do have not created this project or this project does not exist.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
            } else if (checkOwnerResult === "database error") {
                // if any unexpected error occurs when calling the checkOwner function - prompt the user to try again
                response.status(500).render("failure", { failureMessage: "An error occurred when trying to access the database. Please try again.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
            } else {
                // if the user has ownership of the project the render the add-usecase.ejs file with the post route to where the HTTP POST request will be sent to handle the usecase information that the user submits within the form on this page
                response.status(200).render("add-usecase", {postRoute: postRoute});
            }
        });
    }
});

app.post("/staff/projects/add-usecase/:projectId/:usecaseId", authenticateUser, function(request, response){
    // When the files and information about the usecase are sent to this route in the body of the HTTP POST request
    // The addUsecase middleware function is called this function executes the file handling and the database query required to add a usecase to the project.
    addUsecase(request, response, request.params.projectId, request.params.usecaseId);
});

// from the homepage of a project - if the user chooses to edit the project by sending a POST request to this route with the projectId in the body of the projectId
app.post("/staff/projects/edit", authenticateUser,function (request, response) {
    // redirect it to a get route with the project id
    // check that this current user has the right to access this project
    checkOwner(request.body.projectId, request.session.staffId).then(function (checkOwnerResult) {
        if (checkOwnerResult === false) {
            // if the staff member does not - render an error message to the user telling them that they do not have access to this project
            response.status(404).render("failure", { failureMessage: "Access Denied. Either you do have not created this project or this project does not exist.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
        } else if (checkOwnerResult === "database error") {
            // if an error occurs during the database query handled by the checkOwner function to see if the staff member owns a project - render this to the user prompting them to try again
            response.status(500).render("failure", { failureMessage: "An error occurred when trying to access the database. Please try again.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
        } else {
            // if the staff member has access rights - redirect the staff to the correct route for them to edit the project
            response.status(200).redirect("/staff/projects/edit/" + request.body.projectId);
        }
    });
});

// the route that the staff will be redirected to
app.get("/staff/projects/edit/:projectId", authenticateUser,function (request, response) {
    let sanitiseResult = sanitiseInput(request.params.projectId);
    let postRoute = "/staff/projects/edit/" + request.params.projectId;
    if (sanitiseResult === "SQL INJECTION DETECTED") {
        response.status(400).render("failure", { failureMessage: "SQL Injection attempt detected.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    } else if (sanitiseResult === "XSS ATTEMPT DETECTED") {
        response.status(400).render("failure", { failureMessage: "XSS attempt detected.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    } else {
        // continue to actively check the owner has access rights over this project, for the situations where a staff member tries to access this route when they do not have access rights over the project
        checkOwner(request.params.projectId, request.session.staffId).then(function (checkOwnerResult) {
            if (checkOwnerResult === false) {
                response.status(404).render("failure", { failureMessage: "Access Denied. Either you do have not created this project or this project does not exist.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
            } else if (checkOwnerResult === "database error") {
                response.status(500).render("failure", { failureMessage: "An error occurred when trying to connect the the database. Try again later.", link: "/", linkName: "Staff Dashboard" });
            } else {
                // if member of staff has access to this project get information about the project from the database using the getProject function
                getProject(request.params.projectId).then(function(getProjectResult){
                    if (getProjectResult === "error - project does not exist"){
                        response.status(404).render("failure", { failureMessage: "Access Denied. This project does not exist.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
                    }else if(getProjectResult === "database error"){
                        response.status(500).render("failure", { failureMessage: "An error occurred when trying to connect the the database. Try again later.", link: "/", linkName: "Staff Dashboard" });
                    }else{
                        // when the project information is returned from the database by returning the result of the getProject function. render the "edit-project.ejs" file which will provide the user with a form so that they can add edit the project, the route to which this post request will be sent to is also rendered on the dynamic front end page
                        let postRoute = "/staff/projects/edit/" + request.params.projectId;
                        response.render("edit-project", { postRoute: postRoute, project: getProjectResult});
                    }
                });
            }
        });
    }
});

app.post("/staff/projects/edit/:projectId", authenticateUser,function (request, response) {
    // validate whether the user has access rights to this route, as the may directly try to send a POST request directly to this route, which should not be allowed if the current user did not create the project
    // also still need to check the validity of the variable parameter (projectId) using the sanitiseInput to detect any code injection attacks as this is an opportunity for attacks since this value will be used to make requests to the database
    let sanitiseResult = sanitiseInput(request.params.projectId);
    if (sanitiseResult === "XSS ATTEMPT DETECTED") {
        response.status(400).render("failure", { failureMessage: "XSS attempt detected.", link: "/staff-dashboard", link: "Staff Dashboard" });
    } else if (sanitiseResult === "SQL INJECTION DETECTED") {
        response.status(400).render("failure", { failureMessage: "SQL Injection attempt detected.", link: "/staff-dashboard", link: "Staff Dashboard" });
    } else {
        // if there was no potential attack detected in the request route, again check if the logged in staff member 
        checkOwner(request.params.projectId, request.session.staffId).then(function (checkOwnerResult) {
            if (checkOwnerResult === false) {
                // if the member of staff does not have rights to the project deny access and render an error message telling this user this
                response.status(404).render("failure", { failureMessage: "Access Denied. Either you do have not created this project or this project does not exist.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
            } else if (checkOwnerResult === "database error") {
                response.status(500).render("failure", { failureMessage: "An error occurred when trying to connect the the database. Try again later.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
            } else {
                // if the owner does have rights to the project, edit the project by passing in the form data the user inputted into the frontend which resides in the body of the POST request sent to this route, this form data is pased into the function as arguments for the project document to be updated - this database query is executed by the editProject function
                editProject(request.params.projectId, request.body.projectName, request.body.projectDescription, request.body.programmingLanguage, request.body.programmingLanguageVersion, request.body.numberOfFiles, request.body.namingConvention).then(function (editProjectResult) {
                    if (editProjectResult === "unexpected error occured") {
                        // if an unexpected error occurs when executing the database query that the editProject function handles, highlight this to the user in an error message and prompt them to try again
                        response.status(500).render("failure", { failureMessage: "An error occurred when trying to update the project. This may be a database error. Please try again.", link: "/staff-dashboard", linkName: "Staff Dashboard"});
                    } else {
                        // if the editProject function does not return an error message the project document was successfully updated in the datbase, and this should be shown to the user using a success message
                        let successMessage = "Updated Project " + editProjectResult.projectId;
                        response.status(200).render("success", { successMessage: successMessage, link: "/staff-dashboard", linkName: "Staff Dashboard" });
                    }
                });
            }
        });
    }
});

// from the project home page if the user clicks the delete button the project, this action sends a HTTP post request to this route
app.post("/staff/projects/delete", authenticateUser, function (request, response) {
    // in the body of the HTTP post request, the projectId of the project that the member of staff wants to delete is sent
    // when a post request is sent to this route the user is redirected to the route where the project will be deleted
    response.status(200).redirect("/staff/projects/delete/" + request.body.projectId);
});

app.get("/staff/projects/delete/:projectId", authenticateUser, function (request, response) {
    // since this route has a variable parameter (projectId), this value must be checked for any malicious code (using the sanitiseInput function - the purpose of this function is to detect malicious code) as this value will be used by the server to carry out database querie on the backend 
    let sanitiseResult = sanitiseInput(request.params.projectId);

    if (sanitiseResult === "XSS ATTEMPT DETECTED") {
        response.status(400).render("failure", { failureMessage: "XSS attempt detected.", link: "/staff-dashboard", link: "Staff Dashboard" });
    } else if (sanitiseResult === "SQL INJECTION DETECTED") {
        response.status(400).render("failure", { failureMessage: "SQL Injection attempt detected.", link: "/staff-dashboard", link: "Staff Dashboard" });
    } else {
        // if there are no SQL injection attacks on the route - the server now checks if the user trying to access this route (the users data is stored in the session object) has the right to access this route
        checkOwner(request.params.projectId, request.session.staffId).then(function (checkOwnerResult) {
            if (checkOwnerResult === false) {
                response.status(404).render("failure", { failureMessage: "Access Denied. Either you do have not created this project or this project does not exist.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
            } else if (checkOwnerResult === "database error") {
                response.status(500).render("failure", { failureMessage: "An error occurred when trying to update the project. This may be a database error. Please try again." });
            } else {
                // if the logged in member of staff has access over this project and the right to access this route - delete the project as requested - the projectId (unique identifier, primary key) is sent in the request sent in the body of the HTTP request
                // the deleteProject function is then called to delete the project to carry out the user's request (deleting the project files from the server and executing the database query that will delete the project from the )
                deleteProject(request.params.projectId).then(function (deletedProject) {
                    if (deletedProject === "An unexpected error has occurred.") {
                        // if an unexpected error occured while callling the function that carries out the database query that deletes this project render this to the user through an error message prompting them to try again
                        response.status(500).render("failure", { failureMessage: "Failure has occurred in deleting the project. This may be due with an error in trying to connect to the database. Try again.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
                    } else if (deletedProject === "project does not exist") {
                        // Extra error handling for the rare case where this project does no longer exist.
                        response.status(400).render("failure", { failureMessage: "This project does not exist.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
                    } else {
                        // if an error message was not returned by the deleteProject function, the project was successfuly deleted by the query that was handled by this function. This result is then displayed to the user using a success page
                        response.status(200).render("success", { successMessage: "Project successfully deleted. It will no longer be visable to you or students.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
                    }
                });
            }
        });
    }
});

// if from the project page the user selects the button to delete a specific usecase, a post request is sent to the route with the projectId and the usecaseId of the usecase that the user wishes to delete in the body of this request
app.post("/staff/projects/usecase/delete", authenticateUser, function (request, response) {
    // the projectId and the usecaseId of the usecase that the user wants to delete is sent in the body of the POST request and the user is redirected to the correct route for this action to be carried out
    response.status(200).redirect("/staff/projects/usecase/delete/" + request.body.projectId + "/" + request.body.usecaseId);
});

// when the user is redirected this route to delete a usecase on their request
app.get("/staff/projects/usecase/delete/:projectId/:usecaseId", authenticateUser, function (request, response) {

    // since there are variables in the route, these variables must be checked for any malicious code using the sanitiseInput function
    let sanitiseResult1 = sanitiseInput(request.params.projectId);
    let sanitiseResult2 = sanitiseInput(request.params.usecaseId);

    if (sanitiseResult1 === "SQL INJECTION DETECTED" || sanitiseResult2 === "SQL INJECTION DETECTED") {
        response.status(400).render("failure", { failureMessage: "SQL Injection attempt detected.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    } else if (sanitiseResult1 === "XSS ATTEMPT DETECTED" || sanitiseResult2 === "XSS ATTEMPT DETECTED") {
        response.status(400).render("failure", { failureMessage: "XSS attempt detected.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    } else {
        // if there is no malicious code in the route
        // the checkOwner function is then called to verify if the logged in member of staff has the right to perform the delete usecase action on the project
        checkOwner(request.params.projectId, request.session.staffId).then(function (checkOwnerResult) {
            if (checkOwnerResult === false) {
                response.status(404).render("failure", { failureMessage: "Access Denied. Either you do have not created this project or this project does not exist.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
            } else if (checkOwnerResult === "database error") {
                response.status(500).render("failure", { failureMessage: "An error occurred when trying to update the project. This may be a database error. Please try again.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
            } else {
                // if the staff has the rights to perform this action, the deleteUsecase middlware function is called, which handles the deletion of the usecase (deleteing the usecase files from the server and executing the database query that will delete the usecase from the database)
                deleteUsecase(request.params.projectId, request.params.usecaseId).then(function (updatedProject) {
                    if (updatedProject === "An unexpected error has occurred.") {
                        // if an unexpected error occurs when calling the deleteUsecase function - an error message is shown to the user
                        response.status(500).render("failure", { failureMessage: "An error has occurred when deleting this usecase. This may be due to the usecase not existsing. Try again.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
                    } else {
                        // if no error message was returned from the deletedUsecase function the deletion of the usecase was successful - this is shown to the user through a success message
                        return response.status(200).render("success", { successMessage: "Usecase successfully deleted", link: "/staff-dashboard", linkName: "Staff Dashboard" });
                    }
                });
            }
        });
    }
});

app.get("/staff/delete-account", authenticateUser, function (request, response) {
    // this route renders a page which asks the logged in member if they are sure that they want to delete their account - as this is an extreme action, for the usability of the web application the user must be sure that they want to carry out this action
    // the member of staff is logged in so get their staff id from the current session object 
    let deleteAccountLink = "/staff/delete-account/" + request.session.staffId;
    response.status(200).render("delete-account", { deleteAccountLink: deleteAccountLink });
});

app.get("/staff/delete-account/:staffId", authenticateUser,function (request, response) {
    // if the user confirms that they want to delete their account - they are taken to this route
    // since there is a varaible in the route - it needs to be checked by the sanitiseInput function 
    let sanitiseResult = sanitiseInput(request.params.staffId);

    if (sanitiseResult === "SQL INJECTION DETECTED") {
        response.status(400).render("failure", { failureMessage: "SQL Injection attempt detected.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    } else if (sanitiseResult === "XSS ATTEMPT DETECTED") {
        response.status(400).render("failure", { failureMessage: "XSS attempt detected", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    } else {
        // if there is no malicious code - delete the account - using the staffId stored in the session
        deleteAccount(request.session.staffId).then(function (deletedAccount) {
            if (deletedAccount === "Account deleted") {
                // if the account was successfully deleted end the session and redirect the user to the home page
                request.session.destroy;
                response.status(200).redirect("/");
            } else {
                // if an error occured with the database query handled by the deleteAccount render this as an error message to the user
                response.status(500).render("failure", { failureMessage: "An error occurred when deleting your account. Please try again.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
            }
        });
    }
});


app.get("/staff/install-package", authenticateUser, function (request, response) {
    // this route renders a form for the user to input the name of the python package that they wish to install
    response.status(200).render("install-package");
});

app.post("/staff/install-package", authenticateUser, function (request, response) {
    // the packageName variable is the value of the name of the package that the sent in the body of the POST request
    let packageName = String(request.body.packageName);
    let output = [];
    try {
        // install the package on all three python environments as requested by the client using the respective functions and then output the result to the user through the 
        installPythonPackage38(packageName).then(function (result38) {
            output.push(result38);
            installPythonPackage39(packageName).then(function (result39) {
                output.push(result39);
                installPythonPackage310(packageName).then(function (result310) {
                    output.push(result310);
                    response.render("installation-result", { installationResult: output });
                });
            });
        });
    } catch (error) {
        // if any error occurs when calling the functions that install the packages in the respecitve environements render an error message to the user prompting them to try again
        response.render(500).render("failure", { failureMessage: "An unexpected error occurred. Try again.", link: "/staff-dashboard", linkName: "Staff Dashboard" });
    }
});

app.get("/staff/change-password", authenticateUser, function (request, response) {
    // this route renders a form for the user to input their new password
    response.render("change-password");
});

app.post("/staff/change-password", authenticateUser, function (request, response) {
    // get the staffId which is stored in the session and the password sent by the user in the body of the post request to this route
    let staffId = String(request.session.staffId);
    let newPassword = String(request.body.staffNewPassword);

    // then call the change password which handles the database query that will update the staff document to include their new password
    changePassword(staffId, newPassword).then(function (changePasswordResult) {
        if (changePasswordResult === "An unexpected error has occurred.") {
            // if an unexpected error occurred during the exection of the changePassword function render this to the user through a failure page
            response.status(400).render("failure", { failureMessage: "An error occurred when changing your password. This may be a database error. Please try again.", link: "/staff-dashboard", linkName: "Back to Staff Dashboard" });
        } else if (changePasswordResult === "staff not found") {
            // error handling all the possible returns of the changePassword function
            response.status(200).render("failure", { successMessage: "This account does not exist", link: "/", linkName: "Back to Home" });
        } else {
            // if the password was changed successfully by the function - display this to the user through a success message
            response.status(200).render("success", { successMessage: "Password has been changed.", link: "/staff-dashboard", linkName: "Back to Staff Dashboard" });
        }
    });
    response.send("still need to do this route");
});

// the * defines all the other routes than the routes defined above, this is useful for prevening code injection attacks through the routes of the by sayi
app.get("*", function (request, response) {
    // if the user is not logged in
    if (request.session.staffId === null) {
        response.status(404).render("failure", { failureMessage: "This route does not exist.", link: "/", linkName: "Back to Home" });
    } else {
        // if the staff member is logged in. Render the student dashboard
        response.status(404).render("failure", { failureMessage: "This route does not exist.", link: "/staff-dashboard", linkName: "Back to Staff Dashboard" });
    }
});

// the listen function listens for any requests on the port defined, the PORT environment variable may be set by a deployment application if the server is deployed, if not the express server will listen for requests on port 300
app.listen(process.env.PORT || 3000, function () {
    console.log("server listening on port 3000");
});
module.exports = app;