const express = require("express");
const mongoose = require("mongoose");
const Puzzle = require("./puzzle");

const app = express();
app.set("view engine", "ejs");

const port = process.env.PORT || 3000;
const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017/scavenger-hunt";

mongoose.connect(dbURL).then(() => {
  console.log("CONNECTED TO DATABASE");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/:id", async (req, res) => {
  const puzzle = await Puzzle.findById(req.params.id);
  if (puzzle) {
    return res.send(puzzle.title);
  }
  return res.status(404).send("Not Found");
});

app.listen(port, () => {
  console.log(`LISTENING AT PORT ${port}`);
});
