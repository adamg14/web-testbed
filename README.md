# Web Testbed
Educational Python and Java Web Testbed

An educational platform facilitating seamless interaction betwwn lecturers and students. Lecturers can post projects (including Java and Python tasks) with corresponding test scripts, and students can upload their code for automated evaluation feedback.

## Introduction
This web testbed is designed to automated the process of distributing intermediate feedback on submissions. It works with both Java and Python code, with a range of versions. Lecturers can create new projects and attach test scripts; student can submit their solutions, receiving immediate feedback on correctness and functionality. 

## Features 
- __Lecturer Interface__: Upload new projects with associated Java/Python test scripts.
- __Student Interface__:
    - Browse available projects
    - Submit code solutions (Python/Java) and receive automated test results.
-__Automated Testing__: The two codes are simulataneously ran on the server.
-__Security__:
    - Student files immediately deleted after feedback
    - Separate student/lecturer interface
    - Password hashing and salting for secure authentication.
    - Rate limiting to mitigate abuse.

## Technologies Used
- __Backend__: Node.js, Express.js
- __Frontend__: HTML, CSS, JavaScript
- __Database__: MongoDB
- __Authentication__: Passport.js
- __Supported Assignment Language__: Java, Python

# Installation and Basic Setup
1. Clone Repository
```bash
git clone https://github.com/adamg14/web-testbed.git
cd web-testbed
```

2. Install Dependencies
```bash
npm install
```

3. Environment Variables
```javascript
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_random_session_secret
PATH_TO_JAVA=/path/to/java
PATH_TO_JAVAC=/path/to/javac
PATH_TO_PYTHON=/path/to/python
PATH_TO_PIP=/path/to/pip
```

4. Start the Server
```bash
npm start
```

5. Running Unit Tests (Optional)
```bash
npm test
```
Some tests may time out or fail on certain operating systems due to file permissions or path issues. Rerun if you encounter timeouts or adjust Mocha's default timeout settings in the test configuration.

## Important Notes and Troubleshooting

1. __Incompatible Paths for Existing Projects__
    - Projects already loaded on one machine may not work on another due to               differing filesystem paths stored in the database.
    - If a project references absolute paths (e.g., /Users/username/...), you must        update these to match your environment.
    
2. __Staff Upload Files__
    - Must be uploaded as a ZIP file located outside the server’s own directory.
    - The system automatically unzips this file within the projects/ subdirectory.

3. __Updating Static File Routes__
    - When a project is added, you might need to manually adjust certain file             references (e.g., .csv, .txt, or image paths) to ensure they are correct in         your local environment.
    - Example:
          - Original Path:                         ../Images/Student_Test/generated.photos_v3_0626369.jpg,Female,Female
          - Update Path: /Users/adam/Documents/new-upload/projects/<project-id>/<usecase-id>/Testy/Images/Student_Test/generated.photos_v3_0626369.jpg,Female,Female
   - Full absolute paths are sometimes required, including the project and usecase     IDs

4. __Windows Machines__
    - A staff-uploaded ZIP file can produce both a folder and a .zip file with the        same name.
    - Delete the .zip if the folder has already been extracted; only the unzipped         folder is needed for the project to function.

5. __Unit Test Issues__
    - Some file-related tests may fail on Windows labs due to permission or path          differences.
    - This usually does not affect the application's code functionality.

6. __General Troubleshooting__
    - If unexpected errors occur, stop the server with Ctrl + C or Command + C and        then restart.
    - Double-check your .env paths to ensure they match your environment.

## Project Structure
Below is a general outline of some of the directories:
- middleware/: Contains custom middleware functions.
- models/: Contains database schemas and models.
- projects/: Stores uploaded projects and scripts.
- public/: Holds static assets (CSS, images, etc.).
- test/: Test cases for the application logic.
- views/: HTML templates rendered by the server.
- environment_variables.txt: Reference for configuring .env.
- index.js: Main entry point for starting the Node.js server.
