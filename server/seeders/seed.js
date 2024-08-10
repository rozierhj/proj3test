const db = require('../config/connection');
const { Foodie, Comment, Recipe } = require('../models');
const bcrypt = require('bcrypt');
const cleanDB = require('./cleanDB');

  // Generate 50 new Foodie documents

  const sampleComments = [
    "This recipe was amazing!",
    "Loved it, will make again!",
    "Didn't turn out as expected.",
    "Fantastic dish, my family loved it.",
    "Easy to follow and delicious!",
    "Not bad, but needs more seasoning.",
    "Perfect for a quick meal.",
    "Too complicated for me.",
    "My new favorite recipe!",
    "The instructions were a bit unclear."
  ];
  
  const sampleRecipes = [
    {
      title: "Spaghetti Bolognese",
      ingredients: ["Spaghetti", "Ground Beef", "Tomato Sauce", "Garlic", "Onion"],
      instructions: "Cook spaghetti. Brown the ground beef. Add tomato sauce, garlic, and onion. Combine with spaghetti.",
      upVotes: 0,
      apiID: Math.floor(100000 + Math.random() * 900000)
    },
    {
      title: "Chicken Curry",
      ingredients: ["Chicken", "Curry Powder", "Coconut Milk", "Garlic", "Onion"],
      instructions: "Brown the chicken. Add curry powder, coconut milk, garlic, and onion. Simmer until cooked.",
      upVotes: 0,
      apiID: Math.floor(100000 + Math.random() * 900000)
    },
    {
      title: "Grilled Cheese Sandwich",
      ingredients: ["Bread", "Cheese", "Butter"],
      instructions: "Butter the bread. Place cheese between bread slices. Grill until golden brown.",
      upVotes: 0,
      apiID: Math.floor(100000 + Math.random() * 900000)
    },
    // Add more recipes as needed
  ];
  
  db.once('open', async () => {
    try {
      await cleanDB('Foodie', 'foodies');
      await cleanDB('Comment', 'comments');
      await cleanDB('Recipe', 'recipes');
  
      // Generate 50 new Foodie documents
      const foodies = [];
      for (let i = 1; i <= 50; i++) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(`password${i}`, salt);
        foodies.push({
          username: `user${i}`,
          email: `user${i}@example.com`,
          password: hashedPassword,
          favorites: [], // Empty array
          comments: [], // Empty array
        });
      }
      await Foodie.insertMany(foodies);
  
      // Fetch the inserted Foodie documents
      const insertedFoodies = await Foodie.find();
  
      // Generate Recipe documents
      const recipes = await Recipe.insertMany(sampleRecipes);
  
      // Assign 1 to 3 favorite recipes to each Foodie and generate comments
      for (const foodie of insertedFoodies) {
        const favoriteRecipeCount = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
        const favoriteRecipes = [];
        const foodieComments = [];
  
        for (let i = 0; i < favoriteRecipeCount; i++) {
          const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
          favoriteRecipes.push(randomRecipe._id);
  
          // Assign 1 to 3 comments to each Recipe
          const commentCount = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
          for (let j = 0; j < commentCount; j++) {
            const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
            const newComment = {
              username: foodie.username,
              recipe: randomRecipe._id,
              text: randomComment,
            };
            const commentDoc = await Comment.create(newComment);
            foodieComments.push(commentDoc._id);
  
            // Update the recipe with the new comment
            await Recipe.updateOne({ _id: randomRecipe._id }, { $push: { comments: commentDoc._id } });
          }
        }
  
        // Ensure the Foodie has between 1 and 3 favorite recipes from the existing recipes
        const additionalFavoriteCount = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
        for (let i = 0; i < additionalFavoriteCount; i++) {
          const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
          if (!favoriteRecipes.includes(randomRecipe._id)) {
            favoriteRecipes.push(randomRecipe._id);
          }
        }
  
        // Update the Foodie's favorite recipes and comments
        await Foodie.updateOne({ _id: foodie._id }, { favorites: favoriteRecipes, comments: foodieComments });
      }
  
      console.log('Seed data inserted');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });