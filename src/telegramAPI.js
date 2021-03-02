const messages = require('./messages');
const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TOKEN, {polling: false, webHook: false});
const ADMIN = process.env.ADMIN_CHATROOM;

module.exports.processChatroomMessage = (msg) => { return null;}

module.exports.processAdminMessage = (msg) => {
    let { chat, from, text} = msg;
    if ( text ){
        if(text.match(/^\/start$/)) bot.sendMessage(ADMIN, messages.adminHelp);
        else if (text.match(/^\/send/)) {
            const adminText = text.slice(6);
            const sendId = adminText.match(/^([0-9]+) /);
            let   sendText = adminText.replace(sendId[1], "");
            sendText = "Админ сообщества MotoMarket передает вам:\n" + sendText.slice(1);
            bot.sendMessage(sendId[1], sendText).then(id => {
                bot.sendMessage(ADMIN, `Сообщение пользователю ${sendId[1]} отправлено успешно`)
            } ).catch(err => { 
                bot.sendMessage(ADMIN, "Произошла ошибка, не удалось отправить сообщение");
                bot.sendMessage(ADMIN, `error:\n${JSON.stringify(err,null,2)}`);
                console.error(err);
            });
        }
    } 
}

module.exports.processUserMessage = (msg) => {
    let { chat, from, text} = msg;
    if ( text ){
        if(text.match(/^\/start$/)) return bot.sendMessage(from.id, messages.start,{
            reply_markup: {
                one_time_keyboard: true,
                inline_keyboard: [ [{
                        text: "Мотоцикл",
                        callback_data: "МОТОЦИКЛ"
                    }], 
                    [{
                        text: "Экипировка",
                        callback_data: "ЭКИПИРОВКА"
                    }],
                    [{
                        text: "Расходники",
                        callback_data: "РАСХОДНИКИ"
                    }]
                ]
            }
        });
        else if(text.match(/\/console_log/)) return bot.sendMessage(chat.id, chat.id);
    }
    bot.copyMessage(ADMIN, chat.id, msg.message_id).then(id => {
        if (text === undefined) text = "";
        const prependText = `User: ${from.username ? "@" + from.username : "undefined"}    ${from.id} \n---------------------------------\n${text}`;
        const appendText = `${(msg.caption !== undefined) ? msg.caption + "\n---------------------------------" : ""}\nUser: ${from.username ? "@" + from.username : "undefined"}    ${from.id}`;
        

        if(msg.photo || msg.document || msg.sticker) bot.editMessageCaption(appendText, {"chat_id" : ADMIN, "message_id" : id.message_id})
        else bot.editMessageText(prependText, {"chat_id" : ADMIN, "message_id" : id.message_id});
        return id;
    });
}

module.exports.processTypeButtons = (callback) => {
    let {data} = callback;
    let {id} = callback.from;
    bot.editMessageReplyMarkup({}, {
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id
    });
    if(data === 'МОТОЦИКЛ') bot.sendMessage(id, messages.motorcycles);
    if(data === 'ЭКИПИРОВКА') bot.sendMessage(id, messages.equipment);
    if(data === 'РАСХОДНИКИ') bot.sendMessage(id, messages.consumables);
}

module.exports.AllUpdatesToAdmin = data => {
    bot.sendMessage(ADMIN, JSON.stringify(data,null,2));
}