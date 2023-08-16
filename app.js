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

app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/:id", async (req, res) => {
  const puzzle = await Puzzle.findById(req.params.id);
  if (puzzle) {
    return res.render("1", { title: puzzle.title });
  }
  return res.status(404).send("Not Found");
});

app.post("/:id", async (req, res) => {
  const puzzle = await Puzzle.findById(req.params.id);
  if (puzzle && puzzle.answer.includes(req.body.answer.toLowerCase())) {
    res.send(puzzle.reward);
  } else {
    res.redirect(`/${req.params.id}`);
  }
});

app.listen(port, () => {
  console.log(`LISTENING AT PORT ${port}`);
});
