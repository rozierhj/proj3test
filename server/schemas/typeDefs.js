const typeDefs = `
  # Define the Recipe type based on the recipeSchema
  type Recipe {
    _id: ID
    recipeId: Int
    title: String
    image: String
    
  }

  # Define the Foodie type
  type Foodie {
    _id: ID
    username: String!
    email: String!
    password: String!
    recipeCount: Int
    savedRecipes: [Recipe]
  }

  # Define the Query type
  type Query {
    me: Foodie
  }

  # Define the Mutation type for creating and updating foodies
  type Mutation {
    login(email: String!, password: String!): Auth
    addFoodie(username: String!, email: String!, password: String!): Auth
    saveRecipe(title: String, recipeId: Int, image: String): Foodie
    removeRecipe(recipeId: Int!): Foodie
  }

  # Define the Auth type to handle authentication responses
  type Auth {
    token: ID!
    foodie: Foodie
  }
`;

module.exports = typeDefs;