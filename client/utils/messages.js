const moment = require("moment")
function messageFormat(name,text,position,avatar){
    const msgFormat = {
        userName :name,
        text : text,
        position:position,
        avatar:avatar,
        time : moment().format("hh:mm a")
    }
    return msgFormat;
}

module.exports = messageFormat;