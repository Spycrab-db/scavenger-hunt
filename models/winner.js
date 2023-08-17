const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema({
  id: String,
  time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Winner", winnerSchema);
