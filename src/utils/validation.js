const validator = require("validator");

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password} = req.body;

    if(!firstName || !lastName || !emailId || !password) {
        throw new Error("All fields are mandatory");
    } else if (!validator.isEmail(emailId)){
        throw new Error("EmailId is not valid");
    } else if (!validator.isStrongPassword(password)){
        throw new Error("Password is not strong enough");
    }
};

module.exports = {  validateSignUpData };