# web-testbed
Educational Java and Python Web Testbed
ake sure that the 'new-upload' directory is installed and unzipped on your machine
1. Download node.js on your computer (version 16+). https://nodejs.org/en/download.
2. On the termial: type 'node -v' to check if node has downloaded and the version
3. On terminal/command prompt and go within the 'new-upload' directory. Make sure the node_modules directory within 'new-upload' is deleted. Enter the command 'npm install' in the command prompt to install the dependencies needed by the project, a new node_modules directory should appear in the 'new-upload' directory.
7. Create a '.env' file in the 'new-upload' and define the environment variables that are defined within the 'environment_variables.txt' file within the 'new-upload' directory. Follow the instructions in this text file to define the environment variables in the .env file. There are variables already defined in the file, copy these into the newly created .env file. The paths to javac/java/pip/python needed to be updated with the paths on the machine you are running the server on. 
8. Enter the command 'node index.js'/'npm start' to start the server
9. Once this command is run, you should see 'server listening on port 3000' in the command line
10. At any time, or if an unexpected error has occurred, command/ctrl + c at the command line to stop the running of the server and run the command in step 6 to restart the server.
11. Optionally, run the command 'npm test' to run the test scripts that contain the unit tests. Some editing may need to be done to the tests to make sure they run. This command may have to be re-run for the tests to be passed as they may go over the time limit set by mocha. 

IMPORTANT NOTES:
Projects already loaded on the server will not work on your machine due to the incommatability of the paths stored in the MongoDB database.

Staff upload files should not be within the server directory - must be uploading a zip file which is located in separate directory

Any unexpected problems occur. Try restarting the server. Ctrl/Command C in command line and then re run the server

When adding a project and there are routes in static files such as .csv and .txt files, these routes need to be updated. Once the project and usecase have been succesffully added you will need to go into the server files to update these.
To do this:
    - Go into the projects subdirectory of the server directory.
    - Go into the subdirectory of the project that you have just added (the newest made subdirectory).
    - Go into the subdirectory of the usecase that you have just added (the newest made subdirectory again).
    - Here you will see the project code that you have updated, go into all the static files and update the routes which will need to be changed to reflect their routes on the server.
    - When redefining the routes they must be full routes, including the routes of the primary key of the project and usecase
    GIVE AN EXAMPLE:
    ORIGINAL PATH: ../Images/Student_Test/generated.photos_v3_0626369.jpg,Female,Female
    UPDATED PATH: /Users/adam/Documents/new-upload/projects/lgryz5b001pi9d006297k3jr/lgryz5b001pi9d006297kaic/Testy/Images/Student_Test/generated.photos_v3_0626369.jpg,Female,Female

For adding projects on a windows machine, there will be the project directory and the zip files with the same name. This will happen when the staff upload is unzipped. The zip file needs to be deleted.
    In the projects subdirectory of the 'new-upload' directory, go to the newest made subdirectory (the newest made project).
    In this subdirectory, go to the newest directory again (the newest made usecase). In this subdirectory, the staff upload will reside (both the zipped and unzipped version). For the staff upload to work the zipped version
    e.g. ORIGINAL USECASE DIRECTORY CONTENT:
    - staff-upload/
    - staff-upload.zip
    UPDATED USECASE DIRECTORY CONTENT:
    - staff-upload

Some of the unittests did not work when i went and tried to run it in the windows lab(the functionality of the web application still worked). Mainly the ones that invlove files which could be to do with file permissions. However the application still worked fine.
