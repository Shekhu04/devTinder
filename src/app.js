const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');

app.use(express.json());

//SignUp Api
app.post("/signup", async (req,res) => {
    //Creating a new instance of User model
    const user = new User(req.body);
    //Saving the user to the database
    try {
    await user.save();
    res.send("User added successfully")
    }
    catch(err) {
        res.status(400).send("Error while saving user" + err.message);
    }   
});

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

