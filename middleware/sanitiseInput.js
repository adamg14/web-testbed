// the job of this function is to check that user input into the routes where there are variable parameters is valid.
function sanitiseInput(input){
    // this function is for sanitising the to make sure no SQL Injections or XSS attacks occur
    let stringInput = String(input);

    if(stringInput.includes("$") || stringInput.includes("{")){
        // if characters that are commonly used to inflict SQL injection attacks occur, return SQL Injection attack occurred
        return "SQL INJECTION DETECTED";
    }else if(stringInput.toLowerCase().includes("<script") || stringInput.includes("onError") || stringInput.toLowerCase().includes("<img") || stringInput.toLowerCase().includes("alert")){
        // if javascript attributes /HTML tags commonly used to carry out injection of code attacks () the function will return XSS ATTEMPT DETECTED
        return "XSS ATTEMPT DETECTED";
    }else{
        // if the input of the user is valid, the function will just return the 
        return stringInput;
    }
}


module.exports = sanitiseInput;