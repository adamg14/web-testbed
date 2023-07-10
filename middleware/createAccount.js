const staff = require("../models/staff");
const passwordHashing = require("./passwordHashing");
const puid = require("puid");

// this function is used to create an account for a member of staff by adding a document into the staff collection within the database 
async function createAccount(email, password){
    try {

        // using the puid module to generate a primary key for the member of staff
        let PUID = new puid();
        let staffId = PUID.generate();

        // hash the password using the function from the passwordHashing.js function
        let passwordHash = passwordHashing(password);
        
        // create a new object using the staff model defined in the ../models/staff.js file
        let newStaff = new staff({
            staffId: staffId,
            email: email,
            password: passwordHash,
        });

        // wait for the new staff object to be stored in the databse
        await newStaff.save();

        // return the new staff object once it has been added to the database
        return newStaff;
    } catch (error) {
        // if an error has occurred during this function that carries out a query to the database - return the error message to the user.
        return "unexpected error occurred";
    }
}

module.exports = createAccount;