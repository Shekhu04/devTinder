const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
      "mongodb+srv://Shikhar:shekhuinsta44@namastenode.nucau.mongodb.net/devTinder"
    );
};
module.exports = connectDB;



