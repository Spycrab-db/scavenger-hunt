const mongoose = require("mongoose");

const puzzleSchema = new mongoose.Schema({
  number: Number,
  title: String,
  question: String,
  code: String,
  answer: {
    type: [String, Array],
  },
  reward: String,
});

module.exports = mongoose.model("Puzzle", puzzleSchema);
