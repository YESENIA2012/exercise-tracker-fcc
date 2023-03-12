const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

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
      userId: String,
    });

    const Exercise = mongoose.model("Exercise", exerciseSchema);

    app.post("/api/users", async (req, res) => {
      const username = req.body.username;
      try {
        const userFound = await User.findOne({ username });
        if (userFound) {
          res.json(userFound);
        }

        const user = await User.create({
          username,
        });

        res.json(user);
      } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
      }
    });

    app.get("/api/users", async (req, res) => {
      try {
        const users = await User.find();
        res.json(users);
      } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
      }
    });

    app.post("/api/users/:_id/exercises", async (req, res) => {
      const userId = req.params._id;
      let date = req.body.date;
      const duration = parseInt(req.body.duration);
      const description = req.body.description;

      if (date === "" || date === undefined) {
        date = new Date().toDateString();
      } else {
        date = new Date(date).toDateString();
      }

      try {
        const foundIdUser = await User.findById(userId);
        if (!foundIdUser) {
          return res.status(500).send({ message: "User not found" });
        }

        await Exercise.create({
          username: foundIdUser.username,
          description: description,
          duration: duration,
          date: date,
          userId,
        });

        const userObjData = {
          _id: userId,
          username: foundIdUser.username,
          date: date,
          duration: duration,
          description: description,
        };

        res.json(userObjData);
      } catch (error) {
        console.log("este es el error 1", error);
        res.status(500).send("Server Error");
      }
    });

    app.get("/api/users/:_id/logs", async (req, res) => {
      const userId = req.params._id;
      const fromDate = new Date(req.query.from).toDateString();
      const toDate = new Date(req.query.from).toDateString();
      const limit = parseInt(req.query.limit);

      try {
        const foundIdUser = await User.findById(userId);

        if (!foundIdUser) {
          return res.status(404).json({ message: "User not found" });
        }

        let query = { userId: userId };

        let exercisesUser = Exercise.find(query);

        if (limit) {
          exercisesUser = exercisesUser.limit(limit);
        }

        exercisesUser = await exercisesUser.exec();

        const log = exercisesUser.map((exercise) => ({
          description: exercise.description,
          duration: exercise.duration,
          date: new Date(exercise.date).toDateString(),
        }));

        res.send({
          _id: userId,
          username: foundIdUser.username,
          count: exercisesUser.length,
          log: log,
        });
      } catch (error) {
        console.log("este es el error 2", error);
        res.status(500).send("Server Error");
      }
    });
  })
  .catch((error) => {
    console.log("error", error);
    res.status(500).send("Server Error");
  });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
