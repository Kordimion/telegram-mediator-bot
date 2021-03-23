const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE;
const ADMIN = parseInt(process.env.ADMIN_CHATROOM);

module.exports.createUser = (chatroomID, nickname) => {
  return dynamoDB
    .update({
      TableName: tableName,
      Key: {
        chatroom: chatroomID,
      },
      UpdateExpression: `set nickname = :nickname, created_at = :timestamp`,
      ExpressionAttributeValues: {
        ':nickname': nickname,
        ':timestamp': new Date().toDateString(),
      },
    })
    .promise();
};

module.exports.createAdmin = (nickname) => {
  return dynamoDB
    .update({
      TableName: tableName,
      Key: {
        chatroom: ADMIN,
      },
      UpdateExpression: `set nickname = :nickname, created_at = :timestamp, lastSentMessage = :message`,
      ExpressionAttributeValues: {
        ':nickname': nickname,
        ':timestamp': new Date().toDateString(),
        ':message': 10000,
      },
    })
    .promise();
};

module.exports.setAdminLatestMessage = (messageId) => {
  return dynamoDB
    .update({
      TableName: tableName,
      Key: {
        chatroom: ADMIN,
      },
      UpdateExpression: `set lastSentMessage = :message`,
      ExpressionAttributeValues: {
        ':message': messageId,
      },
    })
    .promise();
};

// warning!
// this function can return nothing if nickname does not exist
// this is done to process it in business logic of an app
module.exports.getChatroomByNickname = (nickname) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      IndexName: 'nickname',
      KeyConditionExpression: `#nick = :nickname`,
      ExpressionAttributeNames: {
        '#nick': 'nickname',
      },
      ExpressionAttributeValues: {
        ':nickname': nickname,
      },
    };

    dynamoDB.query(params, (error, result) => {
      if (error) reject(error);
      else if (result.Count > 1) reject('Nicknames must be unique');
      else resolve(result);
    });
  });
};

module.exports.getUserByChatroom = (chatroom) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        chatroom: chatroom,
      },
    };

    dynamoDB.get(params, (error, result) => {
      if (error) reject(error);
      else resolve(result.Item);
    });
  });
};
