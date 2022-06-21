const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const server = express();

// Parse request body
server.use(express.json());

// Routes
const AuthRouter = require("./routes/user");

// Mounting Routes
server.use("/api/v1", AuthRouter);

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connected to database`);
    console.log(`Server is running at ${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
});
