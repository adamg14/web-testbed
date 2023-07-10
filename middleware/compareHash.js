const bcrypt = require("bcrypt");

// this function compares the plaintext to a hash to see if when the hash function is applied to the plaintext, it has the same value as the hash provided as an argument - this is by using the compare function provided (returns true if they match or false if they do not)
function compareHash(plaintext, hash){
    return bcrypt.compareSync(plaintext, hash);
}

module.exports = compareHash;