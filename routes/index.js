//import requried packeges
const express = require("express");
const router = express.Router();
const passport = require("passport");

//home controller for home page
const homeController = require("../controllers/home_Controller");

// Public routes
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  return res.redirect("/employees/sign-in");
});

// Protected routes
router.get("/home", passport.checkAuthentication, homeController.home);
router.get("/profile", passport.checkAuthentication, homeController.profile);
router.get("/download-csv", passport.checkAuthentication, homeController.download);

// Employee routes (some are public, some are protected)
router.use("/employees", require("./employees"));

// Protected routes
router.use("/students", passport.checkAuthentication, require("./students"));
router.use("/interviews", passport.checkAuthentication, require("./interviews"));
router.use("/jobs", passport.checkAuthentication, require("./jobs"));

module.exports = router;
