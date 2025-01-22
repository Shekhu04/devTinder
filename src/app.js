const express = require('express');
const app = express();

app.use("/test",(req,res) => {
    res.send("Hello from the server side");
})
app.use("/hello",(req,res) => {
    res.send("Hello");
})
app.use("/",(req,res) => {
    res.send("Hello from the dashboard");
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});