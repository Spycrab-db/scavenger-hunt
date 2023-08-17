const express = require("express");
const mongoose = require("mongoose");
const Puzzle = require("./models/puzzle");
const Winner = require("./models/winner");

const app = express();
app.set("view engine", "ejs");

const port = process.env.PORT || 3000;
const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017/scavenger-hunt";

mongoose
  .connect(dbURL)
  .then(() => {
    console.log("CONNECTED TO DATABASE");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/:id", async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    if (Number(puzzle.number) <= 5) {
      return res.render(puzzle.number, {
        id: puzzle.id,
        title: puzzle.title,
        question: puzzle.question,
      });
    }
    return res.render("cipher", {
      id: puzzle.id,
      title: puzzle.title,
      question: puzzle.question,
      code: puzzle.code,
    });
  } catch (e) {
    return res.status(404).send("Not Found");
  }
});

// Route for posting team ID
app.post("/win", async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.body.questionID);
    if (puzzle.answer.includes(req.body.answer)) {
      const winner = new Winner({ id: req.body.id });
      winner.save();
      res.render("success");
    }
  } catch {
    res.status(401).send("UNAUTHORIZED REQUEST");
  }
});

// Route for submitting and checking answer
app.post("/:id", async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    if (puzzle) {
      // Check answer as an array
      if (req.body.checkList) {
        const answer = [];
        const keys = Object.keys(req.body);
        keys.forEach((key) => {
          if (key !== "checkList") answer.push(req.body[key]);
        });
        if (JSON.stringify(answer) === JSON.stringify(puzzle.answer)) {
          return res.render("reward", { reward: puzzle.reward });
        }
        return res.redirect(`/${req.params.id}`);
      }

      // Check answer against an array of correct answers
      if (puzzle.answer.includes(req.body.answer.toLowerCase())) {
        if (puzzle.number === "8") {
          return res.render("win", {
            questionID: puzzle.id,
            answer: req.body.answer,
          });
        }
        return res.render("reward", { reward: puzzle.reward });
      }
      return res.redirect(`/${req.params.id}`);
    }
    return res.redirect(`/${req.params.id}`);
  } catch (e) {
    return res.status(500).send("INVALID POST REQUEST");
  }
});

app.listen(port, () => {
  console.log(`LISTENING AT PORT ${port}`);
});
