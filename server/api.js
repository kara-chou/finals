/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Class = require("./models/class");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.get("/session-debug", (req, res) => {
  res.json({
    sessionID: req.sessionID,
    sessionUser: req.session.user ? req.session.user._id : null,
    reqUser: req.user ? req.user._id : null,
    isLoggedIn: !!req.user,
    cookies: req.headers.cookie,
  });
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// Get all classes for the current user
router.get("/classes", auth.ensureLoggedIn, async (req, res) => {
  try {
    const classes = await Class.find({ userId: req.user._id });
    res.send(classes);
  } catch (err) {
    console.error("Failed to get classes:", err);
    res.status(500).send({ error: "Failed to get classes" });
  }
});

// Create a new class
router.post("/classes", auth.ensureLoggedIn, async (req, res) => {
  try {
    const newClass = new Class({
      userId: req.user._id,
      name: req.body.name,
      currentGrade: req.body.currentGrade,
      desiredGrade: req.body.desiredGrade,
      finalWeight: req.body.finalWeight,
      isUsingCategories: req.body.isUsingCategories,
      categories: req.body.categories || [],
    });
    const savedClass = await newClass.save();
    res.send(savedClass);
  } catch (err) {
    console.error("Failed to create class:", err);
    res.status(500).send({ error: "Failed to create class" });
  }
});

// Delete a class
router.delete("/classes/:id", auth.ensureLoggedIn, async (req, res) => {
  try {
    const result = await Class.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // Ensure user can only delete their own classes
    });

    if (!result) {
      return res
        .status(404)
        .send({ error: "Class not found or you don't have permission to delete it" });
    }

    res.send(result);
  } catch (err) {
    console.error("Failed to delete class:", err);
    res.status(500).send({ error: "Failed to delete class" });
  }
});

// Get a single class by ID
router.get("/classes/:id", auth.ensureLoggedIn, async (req, res) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.id,
      userId: req.user._id, // Ensure user can only get their own classes
    });

    if (!classData) {
      return res
        .status(404)
        .send({ error: "Class not found or you don't have permission to view it" });
    }

    res.send(classData);
  } catch (err) {
    console.error("Failed to get class:", err);
    res.status(500).send({ error: "Failed to get class" });
  }
});

// Update a class
router.put("/classes/:id", auth.ensureLoggedIn, async (req, res) => {
  try {
    const updatedClass = await Class.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id, // Ensure user can only update their own classes
      },
      {
        name: req.body.name,
        currentGrade: req.body.currentGrade,
        desiredGrade: req.body.desiredGrade,
        finalWeight: req.body.finalWeight,
        isUsingCategories: req.body.isUsingCategories,
        categories: req.body.categories || [],
      },
      { new: true } // Return the updated document
    );

    if (!updatedClass) {
      return res
        .status(404)
        .send({ error: "Class not found or you don't have permission to update it" });
    }

    res.send(updatedClass);
  } catch (err) {
    console.error("Failed to update class:", err);
    res.status(500).send({ error: "Failed to update class" });
  }
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
