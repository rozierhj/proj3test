const typeDefs = `
  # Define the Book type based on the bookSchema
  type Book {
    _id: ID
    bookId: String
    authors: [String]
    description: String
    title: String
    image: String
    link: String
    
  }

  # Define the User type
  type User {
    _id: ID
    username: String!
    email: String!
    password: String!
    bookCount: Int
    savedBooks: [Book]
  }

  # Define the Query type
  type Query {
    me: User
  }

  # Define the Mutation type for creating and updating users
  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(authors: [String], description: String, title: String, bookId: String, image: String, link: String): User
    removeBook(bookId: String!): User
  }

  # Define the Auth type to handle authentication responses
  type Auth {
    token: ID!
    user: User
  }
`;

module.exports = typeDefs;