const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const port = 3000;

const users = {};

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/chat/:nickname", function (req, res) {
  if (!req.params || !req.params.nickname) res.redirect("/");
  else res.render("chat", { nickname: req.params.nickname });
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

    console.log("User connected.");
    console.log(data);
  });

  socket.on("send-message", (data) => {
    socket.broadcast.emit("received-message", data);
    
    console.log(data);
  });

  socket.on("user-disconnected", () => {
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];

    console.log("User disconnected.");
    console.log(users);
  });
});
