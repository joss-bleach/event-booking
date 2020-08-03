const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

// Set up app and json parser middleware
const app = express();
app.use(express.json({ extended: false }));

// GraphQL server setup
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return ["Codecon", "Comiccon"];
      },
      createEvent: (args) => {
        const eventName = args.name;
        return eventName;
      },
    },
    graphiql: true,
  })
);

// Assign port
const PORT = process.env.PORT || 3000;

// Listen on the port
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
