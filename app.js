const express = require("express");

// Set up app and json parser middleware
const app = express();
app.use(express.json({ extended: false }));

// Assign port
const PORT = process.env.PORT || 3000;

// Listen on the port
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
