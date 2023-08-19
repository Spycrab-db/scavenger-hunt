const mongoose = require("mongoose");

const puzzleSchema = new mongoose.Schema({
  _id: String,
  number: Number,
  title: String,
  question: String,
  code: String,
  answer: {
    type: [String, Array],
  },
  reward: Array,
});

module.exports = mongoose.model("Puzzle", puzzleSchema);
