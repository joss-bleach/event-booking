const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const connectDb = require("./config/db");

// Mongoose Models
const Event = require("./models/Event");

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
          if (!events) {
            console.log("No Events.");
          }
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
          });
          const newEvent = await event.save(event);
          if (!newEvent) {
            console.log("Error.");
          }
          return newEvent;
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
