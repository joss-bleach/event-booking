const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const connectDb = require("./config/db");

// Set up app and json parser middleware
const app = express();
app.use(express.json({ extended: false }));

// Connect Database
connectDb();

//
const graphqlSchema = require("./graphql/schema/index");
const graphqlResolvers = require("./graphql/resolvers/index");

// GraphQL server setup
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
  })
);

// Assign port
const PORT = process.env.PORT || 3000;

// Listen on the port
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
