const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema({
  teamID: String,
  name: String,
  time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Winner", winnerSchema);
