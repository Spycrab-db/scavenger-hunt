const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const Puzzle = require("./models/puzzle");
const Team = require("./models/team");
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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: { "img-src": ["'self'", "res.cloudinary.com"] },
    },
  })
);
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
        input: req.query.input || null,
        incorrect: req.query.incorrect || null,
      });
    }
    return res.render("cipher", {
      id: puzzle.id,
      title: puzzle.title,
      question: puzzle.question,
      code: puzzle.code,
      input: req.query.input || null,
      incorrect: req.query.incorrect || null,
    });
  } catch (e) {
    return res.status(404).send("Not Found");
  }
});

// Route for posting team ID
app.post("/win", async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.body.questionID);
    const teamExists = await Team.exists({ _id: req.body.id });
    const winnerExists = await Winner.exists({ teamID: req.body.id });
    if (!puzzle || !puzzle.answer.includes(req.body.answer)) {
      return res.status(401).send("UNAUTHORIZED REQUEST");
    }
    if (!teamExists || winnerExists) {
      return res.render("win", {
        questionID: req.body.questionID,
        answer: req.body.answer,
        teamNameInput: req.body.name,
        teamIDInput: req.body.id,
        invalidID: true,
      });
    }
    const winner = new Winner({ teamID: req.body.id, name: req.body.name });
    winner.save();
    return res.render("success");
  } catch {
    return res.send("ERROR");
  }
});

// Route to check string-answer against an array of correct answers
app.post("/:id/check-string", async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    if (!puzzle) return res.send("NOT FOUND");
    if (puzzle.answer.includes(req.body.answer.toLowerCase())) {
      if (puzzle.number === "8") {
        return res.render("win", {
          questionID: puzzle.id,
          answer: req.body.answer,
          teamNameInput: null,
          teamIDInput: null,
          invalidID: null,
        });
      }
      return res.render("reward", { reward: puzzle.reward });
    }
    return res.redirect(
      `/${req.params.id}?incorrect=true&input=${req.body.answer}`
    );
  } catch (e) {
    return res.status(500).send("SERVER ERROR");
  }
});

// Route to check answer as an array
app.post("/:id/check-array", async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    if (!puzzle) return res.send("NOT FOUND");
    const incorrect = [];
    for (let i = 0; i < puzzle.answer.length; i += 1) {
      if (!(req.body[i] === puzzle.answer[i])) {
        incorrect.push(i);
      }
    }
    if (incorrect.length) {
      return res.redirect(
        `/${req.params.id}?incorrect=${incorrect}&input=${Object.values(
          req.body
        )}`
      );
    }
    return res.render("reward", { reward: puzzle.reward });
  } catch {
    return res.status(500).send("SERVER ERROR");
  }
});

app.listen(port, () => {
  console.log(`LISTENING AT PORT ${port}`);
});
