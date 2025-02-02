const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');
const { validateSignUpData } = require('./utils/validation');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {userAuth} = require('./middlewares/auth');

app.use(express.json());
app.use(cookieParser());

//SignUp Api
app.post("/signup", async (req,res) => {
    try{
    //Validating the data
    validateSignUpData(req);

    const {firstName, lastName, emailId, password} = req.body;

    //Encrypting the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    //Creating a new instance of User model
    const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash
    });
    //Saving the user to the database
    await user.save();
    res.send("User added successfully")
    }
    catch(err) {
        res.status(400).send("ERROR :  " + err.message);
    }   
});

//Login Api
app.post("/login", async (req,res) => {
    const {emailId, password} = req.body;

    try{
        const user = await User.findOne({emailId : emailId});
        if(!user){
            throw new Error("Invalid emailId");
        } 
        const isPasswordValid = await user.validatePassword(password);
        if(!isPasswordValid){
            throw new Error("Password is incorrect");
        } else {
            const token = await user.getJWT();
            res.cookie("token", token,{expires: new Date(Date.now() + 1000*60*60*24*7),
            });
            res.send("Login successful");
            console.log("Login successful");
        }
    } catch(err){
        res.status(400).send("ERROR : " + err.message);

    }
});

app.get("/profile",userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
   
  } catch (err) {
    console.error("ERROR: ", err.message);
    res.status(400).send("ERROR : " + err.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req,res) => {
    const user = req.user;
    
    res.send(user.firstName + " has sent a connection request");
})
;
//Get user by email
app.get("/user", async (req,res) => {
    const userEmail = req.body.emailId;

    try{
    const user = await User.findOne({emailId : userEmail});
    if(!user){
        res.status(404).send("User not found");
    } else {
        res.send(user);
    }
    } catch(err){
        res.status(400).send("Something went wrong");
    }
});

//Feed Api = GET /feed - get all the users from the database
app.get("/feed", async (req,res) => {
    try{
        const users = await User.find({});
        res.send(users);

    } catch(err) {
        res.status(400).send("Something went wrong");
    }
})

//Delete Api
app.delete("/user", async (req,res) => {
    const userId = req.body.userId;

    try{
        const user = await User.findByIdAndDelete(userId);
        if(!user){
            res.status(404).send("User not found");
        } else{
            res.send("User deleted successfully");
        }
        
    } catch(err){
        res.status(400).send("Something went wrong");}
})

//Update data of the users
app.patch("/user/:userId", async (req,res) => {
    const userId = req.params?.userId;
    const data = req.body;

    try{
         const ALLOWED_UPDATES = [
           "photoUrl",
           "about",
           "skills",
           "age",
         ];

         const isUpdateAllowed = Object.keys(data).every((k) => 
           ALLOWED_UPDATES.includes(k)
         );
         if (!isUpdateAllowed) {
          throw new Error("Invalid updates");
         }
         if(data?.skills.length > 10){
            throw new Error("Skills cannot be more than 10");
         }

        const user = await User.findByIdAndUpdate({_id : userId}, data, {
            runValidators: true,
        });
        res.send("User updated successfully");
    } catch(err){
        res.status(400).send("Update failed : " + err.message);
    }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Database connection failed", err);
  });

