const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
  {
    teamID: String,
    name: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Winner", winnerSchema);
