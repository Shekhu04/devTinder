const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');

app.use(express.json());

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

