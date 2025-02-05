const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    console.error("ERROR: ", err.message);
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit" , userAuth, async (req, res) => {
  try {
    if(!validateEditProfileData(req)) {
      throw new Error("Invalid fields for editing profile");
    };

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({ message :`${loggedInUser.firstName}'s profile updated successfully`, data:loggedInUser});
    
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit/password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new Error("Both old and new passwords are required");
    }

    const loggedInUser = req.user;

    // Validate old password
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      loggedInUser.password
    );
    if (!isPasswordValid) {
      throw new Error("Old password is incorrect");
    }

    // Encrypt new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    loggedInUser.password = newHashedPassword;

    await loggedInUser.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});


module.exports = profileRouter;