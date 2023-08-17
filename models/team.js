const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  _id: String,
});

module.exports = mongoose.model("Team", teamSchema);
