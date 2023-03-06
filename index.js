const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const users = [];
const exercise = [];
const logsUsers = [""];

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.use(express.urlencoded({ extended: false }));

app.post("/api/users", (req, res, next) => {
  const userName = req.body.username;
  const data = { userName: userName, _id: users.length + 1 };
  users.push(data);
  res.redirect("/api/users");
  next();
});

app.get("/api/users", (req, res) => {
  res.send(users[users.length - 1]);
});

app.post("/api/users/:_id/exercises", (req, res, next) => {
  const obj = req.body;
  const userId = parseInt(obj[":_id"]);
  const userName = users[userId - 1].userName;
  const dateExercises = obj.date;
  const durationExercise = obj.duration;
  const descriptionExercise = obj.description;
  let time = null;

  if (dateExercises == "") {
    time = new Date().toDateString();
  } else {
    time = new Date(dateExercises).toDateString();
  }

  const dataExercise = {
    _id: obj[":_id"],
    username: userName,
    date: time,
    duration: durationExercise,
    description: descriptionExercise,
  };

  exercise.push(dataExercise);

  const objExercise = {
    description: descriptionExercise,
    duration: durationExercise,
    date: time,
  };

  if (!logsUsers[userId]) {
    logsUsers.push({
      userName: userName,
      count: 1,
      _id: obj[":_id"],
      log: [objExercise],
    });
  } else {
    logsUsers[userId].log.push(objExercise);
    logsUsers[userId].count = logsUsers[userId].log.length;
  }

  res.redirect("/api/users/:_id/exercises");
  next();
});

app.get("/api/users/:_id/exercises", (req, res) => {
  res.send(exercise[exercise.length - 1]);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const idUser = parseInt(req.params._id);
  console.log(typeof idUser);
  console.log(logsUsers[idUser]);
  res.json(logsUsers[idUser]);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
