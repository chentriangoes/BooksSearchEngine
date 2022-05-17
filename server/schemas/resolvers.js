//Define the query and mutation functionality to work with the Mongoose models.
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
    addUser: async (parent, {username, email, password}) => {
        const newUser = await User.create({username, email, password});
        const token = signToken(newUser);
        return {token, newUser}; 
    },
    login: async (parent, {email, password}) => {
        const user = await User.findOne({email});

        if (!user) {
            throw new AuthenticationError('No User with the email found!');
        }
        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
            throw new AuthenticationError('Incorrect password');
        }
        const token = signToken(user);
        return {token, user};
        
    },
    saveBook: async (parent, args, context) => {
        if (context.user) {
          const userBook = await User.findByIdAndUpdate(
            { _id: context.user._id},
            { $addToSet: { savedBooks: args.input } },
            { new: true, runValidators: true }
      );
      return userBook;
          }
          throw new AuthenticationError('You need to be logged in!');
  
    },
    removeBook: async (parent, args, context) => {
      if (context.user) {
        const bookRemove = await User.findOneAndUpdate(
          {_id:context.user._id},
          {$pull: {savedBooks: {bookId: args.bookId}}},
          {new: true}
        );
        return bookRemove;
      }
  
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;