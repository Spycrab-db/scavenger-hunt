const express = require("express");
const Puzzle = require("./models/puzzle");

function checkPassword(req, res, next) {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    return next();
  }
  return res.redirect("/admin");
}

const admin = express.Router();

admin.get("/", (req, res) => {
  res.render("admin/login");
});

admin.post("/", checkPassword, async (req, res) => {
  try {
    const puzzles = await Puzzle.find({ number: { $ne: 8 } });
    res.render("admin/dashboard", { puzzles, password: req.body.password });
  } catch {
    res.status(500).send("SERVER ERROR");
  }
});
admin.post("/:id", checkPassword, async (req, res) => {
  try {
    const reward = [req.body["0"], req.body["1"], req.body["2"]];
    await Puzzle.findOneAndUpdate({ _id: req.params.id }, { reward });
    const puzzles = await Puzzle.find({ number: { $ne: 8 } });
    res.render("admin/dashboard", { puzzles, password: req.body.password });
  } catch {
    res.status(500).send("SERVER ERROR");
  }
});

module.exports = admin;
