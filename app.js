const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const connectDb = require("./config/db");
const bcrypt = require("bcryptjs");

// Mongoose Models
const Event = require("./models/Event");
const User = require("./models/User");

// Set up app and json parser middleware
const app = express();
app.use(express.json({ extended: false }));

// Connect Database
connectDb();

// GraphQL server setup
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String 
        }

        input UserInput {
            email: String!
            password: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: async () => {
        try {
          const events = await Event.find();
          return events.map((event) => {
            return { ...event._doc };
          });
        } catch (err) {
          console.log(err);
        }
      },
      createEvent: async (args) => {
        try {
          const { title, description, price, date } = args.eventInput;

          const event = new Event({
            title: title,
            description: description,
            price: price,
            date: new Date(date),
            creator: "5f294bfdcef84b0982bd11fd",
          });

          const newEvent = await event.save(event);
          const userEvent = await User.findById("5f294bfdcef84b0982bd11fd");
          userEvent.createdEvents.push(newEvent);
          const updateUser = await userEvent.save();
          return newEvent;
        } catch (err) {
          console.log(err);
          throw err;
        }
      },
      createUser: async (args) => {
        try {
          const { email, password } = args.userInput;

          const checkUser = await User.findOne({ email: email });

          if (checkUser) {
            throw new Error("Email address already in use.");
          }

          const user = new User({
            email: email,
            password: password,
          });

          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);

          const newUser = await user.save(user);
          const createdUser = { ...newUser._doc, password: null };
          return createdUser;
        } catch (err) {
          console.log(err);
          throw err;
        }
      },
    },
    graphiql: true,
  })
);

// Assign port
const PORT = process.env.PORT || 3000;

// Listen on the port
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
