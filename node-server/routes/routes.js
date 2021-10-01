const express = require("express");
const { dirname } = require("path");
const path = require("path");
const router = express.Router();

const views = path.join(__dirname,"../../client/views")

//default page or index page
router.get("/", function (req, res) {
    res.render("home", { title: "IG CodeForm" });
  });
router.get("/home.hbs", function (req, res) {
    res.render("home", { title: "IG CodeForm" });
  });

//   on clicking join room from home page direct to chat page
router.get("/chat", function (req, res) {
  res.render('chat',{title:"IG ChatForm Chat Room"})
  });

  // Export chat file
// router.get("/msg", function (req, res) {
//   res.sendFile(path.join(__dirname , '../../message.txt'))
//   });
// router.get("/chat", function (req, res) {
//   res.render("chat");
// });

  module.exports = router;