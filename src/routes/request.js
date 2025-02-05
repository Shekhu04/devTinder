const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const requestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type : " + status });
      }

      const toUser = await User.findById(toUserId);
      if(!toUser) {
        return res.status(400).json({ message: "User not found!!" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message:
             "Connection request already exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      let message = "";
      if (status === "interested") {
        message = `${req.user.firstName} is interested in ${toUser.firstName}! 💖`;
      } else if (status === "ignored") {
        message = `${req.user.firstName} ignored ${toUser.firstName}'s profile. ❌`;
      }

      res.json({
        message,
        data
      });
    } catch (err) {
      res.status(400).send("ERROR : " + err.message);
    }

    // res.send(user.firstName + " has sent a connection request");
  }
);

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const {status, requestId} = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if(!allowedStatus.includes(status)) {
      return res.status(400).json({message : "Invalid status type : " + status});
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id : requestId,
      toUserId : loggedInUser._id,
      status : "interested",
    });
    if(!connectionRequest) {
      return res.status(400).json({message : "Connection request not found"});
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();

    res.json({message : `Connection request ${status} successfully`, data});
    
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
    
  }
});

module.exports = requestRouter;
