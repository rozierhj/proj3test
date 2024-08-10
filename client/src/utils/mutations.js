import { gql } from '@apollo/client';

export const ADD_FOODIE = gql`
  mutation addFoodie($username: String!, $email: String!, $password: String!) {
    addFoodie(username: $username, email: $email, password: $password) {
      token
      foodie {
        _id
        username
        email
      }
    }
  }
`;

export const LOGIN_FOODIE = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      foodie {
        _id
        username
        email
      }
    }
  }
`;

export const SAVE_RECIPE = gql`
  mutation saveRecipe($recipeId: Int!, $image: String, $title: String) {
    saveRecipe(recipeId: $recipeId, image: $image, title: $title) {
      _id
      username
      email
      savedRecipes {
        recipeId
        title
        image
      }
    }
  }
`;

export const REMOVE_RECIPE = gql`
  mutation removeRecipe($recipeId: Int!) {
    removeRecipe(recipeId: $recipeId) {
      _id
      username
      email
      savedRecipes {
        recipeId
        title
        image
      }
    }
  }
`;