const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const port = process.env.PORT || 1000;
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const messageFormat = require("../client/utils/messages");

const fs = require("fs");

const {
  userJoin,
  getCurrentUser,
  getRoomName,
  userLeave,
  clearMsg,
  users,
} = require("../client/utils/users");
const botName = "IG bot";
const io = socketio(server);

io.on("connection", (socket) => {
  // console.log("NEW WS CONNECTION FOUND")

  socket.on("joinChat", ({ username, roomname, avatar }) => {
    var user = userJoin(socket.id, username, roomname, avatar);
    socket.join(user.roomname);

    //send userInfo based on the room to client
    io.to(user.roomname).emit("userJoined", {
      roomname: user.roomname,
      users: getRoomName(roomname),
    });

    //Welcome current user
    socket.emit(
      "message",
      messageFormat(botName, `Welcome to IG-ChatForm ${username}`)
    );

    //Broadcast when a new user joins
    socket.broadcast
      .to(user.roomname)
      .emit(
        "message",
        messageFormat(botName, `${username} has joined the chat`)
      );
  });

  //listens to message from client
  socket.on("chatMsgSend", (msg) => {
    var user = getCurrentUser(socket.id);
    saveMsg(user, msg); //save message

    socket.emit(
      "message",
      messageFormat(user.username, msg, "right", user.avatar)
    );
  });
  socket.on("chatMsgReceive", (msg) => {
    var user = getCurrentUser(socket.id);
    // console.log()
    // saveMsg(user,msg);//save message
    socket.broadcast
      .to(user.roomname)
      .emit("message", messageFormat(user.username, msg, "left", user.avatar));
  });

  //function to save msg in text files
  function saveMsg(user, msg) {
    msgTime = messageFormat().time;
    msgDataFormat = `${user.username} (${msgTime}) : ${msg}`;

    //append msgs in the same room text file
    fs.appendFile(
      `${user.roomname}-chat.txt`,
      msgDataFormat + "\n",
      function (err) {
        if (err) throw err;

        //reading file to send to client
        var text = fs.readFileSync(`./${user.roomname}-chat.txt`, "utf-8");

        // var exportChat = text.split("\n");    -----convert text to array

        io.to(user.roomname).emit("exportChat", text);
      }
    );
  }

  //--------------------code to convert string to array and to JSON . abondoned !
  // function saveMsg(user,msg){

  //   //save msgs in txt file in following format
  //   // var exportData = {
  //   //   Username: user.username,
  //   //   message: msg,
  //   //   time: messageFormat().time
  //   // };
  //   // const myJSON = JSON.stringify(exportData);

  //   //append msgs in the same room text file
  //   fs.appendFile(`${user.roomname}-chat.txt`, myJSON + "\n", function (err) {
  //     if (err) throw err;

  //     // console.log("Done Saving!");
  //     var text = fs.readFileSync(`./${user.roomname}-chat.txt`, "utf-8");

  //     //convert file text to array
  //     var exportChat = text.split("\n");
  //     io.to(user.roomname).emit("exportChat", exportChat);
  //   });
  // }
//------------------------------------------------------------------------------------------------------


  //Broadcast when a user disconnects
  socket.on("disconnect", () => {
    var user = userLeave(socket.id);
    if (user) {
      io.to(user.roomname).emit(
        "message",
        messageFormat(botName, `${user.username} has left the chat`)
      );
      io.to(user.roomname).emit("userJoined", {
        roomname: user.roomname,
        users: getRoomName(user.roomname),
      });

      //delete file when no user in that room is present
      delFile = clearMsg(user.roomname);
      if (delFile === true) {
        fs.unlink(`${user.roomname}-chat.txt`, (err) => {
          if (err) {
            throw err;
          }
        });
      }
    }
  });

  //send export msg file
  // socket.emit("export");
});

//setting up directories

//public folder for static files eg.css , js
const publicPath = path.join(__dirname, "../client/public");
app.use(express.static(publicPath));

// specifying views folder in client folder
app.set("views", path.join(__dirname, "../client/views"));

//set view engine as express handlebars
app.set("view engine", "hbs");
app.engine(
  "hbs",
  exphbs({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "../client/views/layouts"),
    partialsDir: path.join(__dirname, "../client/views/partials"),
  })
);

//calling routes from routes folder in node-server
app.use("/", require(path.join(__dirname, "routes/routes.js")));
app.use("/chat", require(path.join(__dirname, "routes/routes.js")));

server.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
