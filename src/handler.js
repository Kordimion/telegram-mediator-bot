const telegramHandler = require('./telegramAPI');
const ADMIN = process.env.ADMIN_CHATROOM;
module.exports.processWebhook = (event, context, callback) => {
  const body = JSON.parse(event.body);

  if(body && body.callback_query) {
    telegramHandler.processTypeButtons(body.callback_query);

    const response = {
      statusCode: 200,
      body: "button callback message successfully received.",
    };
    return callback(null, response);
  } else if (body && body.message) {
    let {chat, from} = body.message;

    if (chat.id != from.id) telegramHandler.processChatroomMessage(body.message)
    else if (from.id == ADMIN) telegramHandler.processAdminMessage(body.message)
    else telegramHandler.processUserMessage(body.message);
    
    const response = {
      statusCode: 200,
      body: "message successfully delivered.",
    };
    return callback(null, response);
  } 

  const response = {
      statusCode: 200,
      body: "resource not found.",
    };
  return callback(null, response);
}