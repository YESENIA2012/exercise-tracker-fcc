const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

mongoose
  .connect(
    "mongodb+srv://fcc-yezze:dilan123@cluster0.ksuzfvl.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected!");
    const userSchema = mongoose.Schema(
      {
        username: {
          type: String,
          unique: true,
        },
      },
      { versionKey: false }
    );

    const User = mongoose.model("User", userSchema);

    const exerciseSchema = mongoose.Schema({
      username: String,
      description: String,
      duration: Number,
      date: String,
      idUser: String,
    });

    const Exercise = mongoose.model("Exercise", exerciseSchema);

    app.post("/api/users", async (req, res, next) => {
      const username = req.body.username;
      const userFound = await User.findOne({ username });

      if (userFound) {
        res.json(userFound);
      }

      const user = await User.create({
        username,
      });

      res.json(user);
      next();
    });

    app.get("/api/users", async (req, res) => {
      const users = await User.find();
      res.send(users);
    });

    app.post("/api/users/:_id/exercises", async (req, res, next) => {
      const obj = req.body;
      const userId = obj[":_id"];
      const foundIdUser = await User.findById(ObjectId(userId));
      const dateExercises = obj.date;
      const durationExercise = obj.duration;
      const descriptionExercise = obj.description;
      let time = null;

      if (dateExercises == "") {
        time = new Date().toDateString();
      } else {
        time = new Date(dateExercises).toDateString();
      }

      if (!foundIdUser) {
        res.json({ message: "User not found" });
      }

      const exercise = await Exercise.create({
        username: foundIdUser.username,
        description: descriptionExercise,
        duration: durationExercise,
        date: time,
        userId: ObjectId(userId),
      });

      res.send({
        username: foundIdUser.username,
        _id: userId,
        description: descriptionExercise,
        duration: durationExercise,
        date: time,
      });
    });
  })
  .catch((error) => {
    console.log("error", error);
  });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
