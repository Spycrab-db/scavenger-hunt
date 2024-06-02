const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const adminRouter = require("./admin");
const Puzzle = require("./models/puzzle");
const Team = require("./models/team");
const Winner = require("./models/winner");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");

const port = process.env.PORT || 8080;
const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017/scavenger-hunt";

mongoose
  .connect(dbURL)
  .then(() => {
    console.log("CONNECTED TO DATABASE");
    app.listen(port, () => {
      console.log(`LISTENING AT PORT ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

if (process.env.NODE_ENV !== "development") {
  console.log("HELMET SECURED");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: { "img-src": ["'self'", "res.cloudinary.com"] },
      },
    })
  );
}
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use("/admin", adminRouter);

app.get("/", async (req, res) => {
  const winners = await Winner.find({}).sort({ createdAt: 1 });
  res.render("home", { winners });
});

app.get("/:id", async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    if (puzzle.number <= 5) {
      return res.render(String(puzzle.number), {
        id: puzzle.id,
        number: puzzle.number,
        title: puzzle.title,
        question: puzzle.question,
        input: req.query.input || null,
        incorrect: req.query.incorrect || null,
      });
    }
    return res.render("cipher", {
      id: puzzle.id,
      number: puzzle.number,
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
    const { questionID, id, answer, name } = req.body;
    const puzzle = await Puzzle.findById(questionID);
    const teamExists = await Team.exists({ _id: id });
    const winnerExists = await Winner.exists({ teamID: id });
    const nameTaken = (await Winner.find({}))
      .map((winner) => winner.name)
      .includes(name);

    if (!puzzle || !puzzle.answer.includes(answer)) {
      return res.status(401).send("UNAUTHORIZED REQUEST");
    }
    if (!teamExists || winnerExists || nameTaken) {
      return res.render("win", {
        questionID,
        answer,
        teamNameInput: name,
        teamIDInput: id,
        invalidID: !teamExists || winnerExists || null,
        nameTaken: nameTaken || null,
      });
    }
    const winner = new Winner({ teamID: req.body.id, name: req.body.name });
    await winner.save();
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
    const { id, number, answer, reward } = puzzle;
    if (answer.includes(req.body.answer.toLowerCase())) {
      if (number === 6) {
        return res.render("win", {
          questionID: id,
          answer: req.body.answer,
          teamNameInput: null,
          teamIDInput: null,
          nameTaken: null,
          invalidID: null,
        });
      }
      return res.render("reward", {
        reward: reward[Math.floor(Math.random() * 3)],
      });
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
    const { answer, reward } = puzzle;
    const incorrect = [];
    for (let i = 0; i < answer.length; i += 1) {
      if (!(req.body[i] === answer[i])) {
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
    return res.render("reward", {
      reward: reward[Math.floor(Math.random() * 3)],
    });
  } catch {
    return res.status(500).send("SERVER ERROR");
  }
});
