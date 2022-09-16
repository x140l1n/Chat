const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const moment = require("moment");

require("dotenv").config();

const port = process.env.PORT || 3000;

const users = {};

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.get("/", function (req, res) {
  res.render("index");
});


app.get("/chat/:nickname", function (req, res) {
  if (!req.params || !req.params.nickname) res.redirect("/");
  else 
  {
    if (!is_nickname_exists(req.params.nickname)) {
      res.render("chat", { nickname: req.params.nickname });
    } else {
      res.redirect("/");
    }
  }
});

app.get("*", function (req, res) {
  res.redirect("/");
});

//Open server.
server.listen(port, function () {
  console.log(`Listening on port ${port}!`);
});

//Events of sockets.
io.on("connection", (socket) => {  
  socket.on("user-connected", (data) => {
    users[socket.id] = data.nickname;
    socket.broadcast.emit("user-connected", data.nickname);

    console.table(users);
  });

  socket.on("writting", (data) => {
    socket.broadcast.emit("user-writting", data);
  });

  socket.on("send-message", (data) => {
    const now = moment();

    data['date'] = now.format("DD/MM/yyyy");
    data['time'] = now.format("HH:mm");

    socket.broadcast.emit("received-message", data);
    
    console.log(data);
  });

  socket.on("user-disconnected", () => {
    if (users[socket.id]) {
      socket.broadcast.emit("user-disconnected", users[socket.id]);
      delete users[socket.id];
  
      console.table(users);
    }
  });
});

function is_nickname_exists(nickname) {
  return Object.values(users).indexOf(nickname) > -1;
}
