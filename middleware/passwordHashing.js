const bcrypt = require("bcrypt");

function passwordHashing(plaintextPassword){
    // generate a salt value to be appended to the hash
    let generatedSalt = bcrypt.genSaltSync(10);
    // apply the hash function to the plaintext password using the hashSync function provided by the bcrypt NPM module
    let hash = bcrypt.hashSync(plaintextPassword, generatedSalt);
    // return the hash to be stored in the database
    return hash;
}

module.exports = passwordHashing;