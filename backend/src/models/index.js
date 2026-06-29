/**
 * @file index.js
 * @description Central barrel export for all Mongoose models.
 *              Import from this file anywhere in the application:
 *
 *   const { User, Product, Conversation, Message, Review } = require('./models');
 */

const User         = require('./User.model');
const Product      = require('./Product.model');
const Conversation = require('./Conversation.model');
const Message      = require('./Message.model');
const Review       = require('./Review.model');

module.exports = {
  User,
  Product,
  Conversation,
  Message,
  Review,
};
