const { miniSerializeError } = require('@reduxjs/toolkit');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 18,
  },
  gender: {
    type: String,
    //By default it will only run when we are registering a new user
    //To run it when we are updating the user, we need to add a parameter in the findByIdAndUpdate function (runValidators: true) in the app.patch("/user") route
    validate(value){
        if(!["male" , "female", "others"].includes(value)){
            throw new Error("Gender data is not valid");
        }
    },
  },
  photoUrl: {
    type: String,
    default: "https://www.pnrao.com/?attachment_id=8917",
  },
  about: {
    type: String,
    default: "This is a default description of the user.",
  },
  skills: {
    type: [String],
  },
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);