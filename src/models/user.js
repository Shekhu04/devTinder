
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("EmailId is not valid : " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        const options = {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        };

        if (!validator.isStrongPassword(value, options)) {
          let error = "Password must have: ";
          if (value.length < options.minLength)
            error += `at least ${options.minLength} characters, `;
          if ((value.match(/[a-z]/g) || []).length < options.minLowercase)
            error += `at least ${options.minLowercase} lowercase letter, `;
          if ((value.match(/[A-Z]/g) || []).length < options.minUppercase)
            error += `at least ${options.minUppercase} uppercase letter, `;
          if ((value.match(/[0-9]/g) || []).length < options.minNumbers)
            error += `at least ${options.minNumbers} number, `;
          if (
            (value.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length <
            options.minSymbols
          )
            error += `at least ${options.minSymbols} special character, `;

          throw new Error(error.slice(0, -2)); // Remove trailing comma and space
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      //By default it will only run when we are registering a new user
      //To run it when we are updating the user, we need to add a parameter in the findByIdAndUpdate function (runValidators: true) in the app.patch("/user") route
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is not valid");
        }
      },
    },
    photoUrl: {
      type: String,
      default: "https://www.pnrao.com/?attachment_id=8917",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Photo URL is not valid : " + value);
        }
      },
    },
    about: {
      type: String,
      default: "This is a default description of the user.",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

//Creating a jwt token for the user
userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({_id : user._id}, "DEV@Tinder$123", {expiresIn : "7d"});

  return token; 
}

userSchema.index({firstName : 1, lastName : 1});
userSchema.methods.validatePassword = async function (passswordInputByUser){
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(passswordInputByUser, passwordHash);

  return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);