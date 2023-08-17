const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");
const Team = require("./models/team");

const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017/scavenger-hunt";

mongoose
  .connect(dbURL)
  .then(() => {
    console.log("CONNECTED TO DATABASE");
  })
  .catch((err) => {
    console.log(err);
  });

for (let i = 0; i < 30; i += 1) {
  const newTeam = new Team({ _id: uuid() });
  newTeam.save();
}
