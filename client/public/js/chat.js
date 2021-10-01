const socket = io();
// Get username and room-name from URL
const { username, roomname } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//Join chat room
socket.emit("joinChat", { username, roomname, avatar: getAvatar() });

//Display room name and username
socket.on("userJoined", ({ roomname, users }) => {
  // var avatarUrl=getAvatar();
  // console.log(users);
  roomName(roomname);
  usersName(users);
});

// Get avatar from URL
function getAvatar() {
  const size = Math.floor(Math.random() * 100 + 50);
  avatarUrl = `url('https://www.placecage.com/${size}/${size}')`;
  var userAvatar = document.querySelector(".user-avatar");
  userAvatar.style.backgroundImage = avatarUrl;
  return avatarUrl;
}
function roomName(roomname) {
  var room = document.querySelector(".rooms").getElementsByTagName("p");
  room[0].innerHTML = roomname;
}
function usersName(users) {
  var username = document.querySelector(".scroll-usernames");
  username.innerHTML = `${users
    .map(
      (user) => `<div class="user-name">
    <img class="user-avatar user-name-avatar" style="background-image: ${user.avatar}";/>
   <span>${user.username}</span>
   </div>`
    )
    .join("")}`;
}

//Message submit
var messageInput = document
  .querySelector(".message-send-box")
  .getElementsByTagName("input");
var sendBtnForm = document.querySelector(".send-btn-form");
var chatbox = document.querySelector(".chatbox");
sendBtnForm.addEventListener("submit", (e) => {
  e.preventDefault();
  msg = messageInput[0].value;

  //send message to server
  socket.emit("chatMsgSend", msg);
  socket.emit("chatMsgReceive", msg);

  messageInput[0].value = "";
  messageInput[0].focus();
});
//send msg when hit enter
messageInput[0].addEventListener("keypress", function(event) {
  if (event.keyCode === 13) {
    console.log("pressed enter")
    event.preventDefault();
    msg = messageInput[0].value;

  //send message to server
  socket.emit("chatMsgSend", msg);
  socket.emit("chatMsgReceive", msg);

  messageInput[0].value = "";
  messageInput[0].focus();
  }
});

//insert message from server to respected DOM
socket.on("message", (messageFormat) => {
  outputMsg(messageFormat);
  chatbox.scrollTop = chatbox.scrollHeight;
});
function outputMsg(messageFormat) {
  if (messageFormat.userName === "IG bot") {
    //for ig bot avatar
    var div = document.createElement("div");
    div.classList.add("chats", `chat-${messageFormat.position}`);
    div.innerHTML = `<img class="user-avatar user-msg-avatar ig-bot-avatar"/>
      <span class="name">${messageFormat.userName}</span>
      <span class="time">${messageFormat.time}</span>
      <p class="text">
        ${messageFormat.text}
      </p>`;
    document.querySelector(".chatbox").appendChild(div);
  } else {
    var div = document.createElement("div");
    div.classList.add("chats", `chat-${messageFormat.position}`);
    div.innerHTML = `<img class="user-avatar user-msg-avatar" style="background-image: ${messageFormat.avatar}"/>
    <span class="name">${messageFormat.userName}</span>
    <span class="time">${messageFormat.time}</span>
    <p class="text">
      ${messageFormat.text}
    </p>`;
    document.querySelector(".chatbox").appendChild(div);
    // socket.emit("addMsg",msgDataFormat)
  }
}

//function to leave room
leaveRoom = document.querySelector(".leave-room-btn");
leaveRoom.addEventListener("click", () => {
  leave = confirm("Are you sure you want to Leave Room ?");
  if (leave == true) {
    location.href = "/home.hbs";
  }
});


//function to export data
let text
var exportText = document.querySelector(".export-btn");
socket.on("exportChat", (exportChat) => {
  text=exportChat;
  console.log(text);
});

  exportText.addEventListener("click", () => {
    var blob = new Blob([text], { type: "text/txt;charset=utf-8" });
    saveAs(blob, "IG-ChatForm chats.txt");
});
