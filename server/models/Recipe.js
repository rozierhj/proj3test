const { Schema } = require('mongoose');

// This is a subdocument schema, it won't become its own model but we'll use it as the schema for the User's `savedBooks` array in User.js
const recipeSchema = new Schema({
  // saved book id from GoogleBooks
  recipeId: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
});

module.exports = recipeSchema;