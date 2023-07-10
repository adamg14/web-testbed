const staff = require("../models/staff");

// the function carries out the database query of deleting the staff document from the staff collection - which gives the web application the functionality of allowing the member of staff to delete their account
async function deleteAccount(staffId){
    try {
        // carrying out the database query of finding the staff object in the document- this function will be called with the staffId argument of the staffId stored in the session data
        staff.findOne({staffId: staffId}, function(error, foundStaff){
            // if the query returns null this means that the staff was not found
            if (foundStaff === null){
                return "staff not found";
            }
        });
        // if the staff document exists, the function will delete this
        await staff.findOneAndDelete({staffId: staffId});
        // once the document has been deleted from the database the function will return the string "account deleted"
        return "Account deleted";
    } catch (error) {
        // if any unexpected error occurs while the function is running - the string "an unexpected error has occurrred" will be returned
        return "An unexpected error has occurred";
    }
}

module.exports = deleteAccount;
