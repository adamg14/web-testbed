const staff = require("../models/staff");
const hashPassword = require("../middleware/passwordHashing");

async function changePassword(staffId, newPassword){
    try {
        // hash the password using the function from the passwordHashing.js file
        let newPasswordHash =  hashPassword(newPassword);
        // find the staff document from the database and wait for the query response from the database
        let foundStaff = await staff.findOne({staffId: staffId});
        // if the database query doesnt resturn anything from the database - the staff document does not exist in the database -return an error message saying this
        if (foundStaff === null){
            return "staff not found";
        }else{
            // if a document - update this document in the database so that the password field contains the hash of the updated password and await for the updated staff object to be returned by the database query
            let updatedStaff = await staff.findOneAndUpdate({staffId: staffId}, {password: newPasswordHash});
            // once the staff database object is updated with the new passed return the string - "updated staff"
            return "updated staff";
        }
    } catch (error) {
        // if any error occurs when e.g. the connection to the database is lost - return this error message 
        return "An unexpected error has occurred.";
    }
}

module.exports = changePassword;


