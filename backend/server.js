const app = require('./index'); // Imports the Express app from index.js
const database = require('./database'); // Import database for initDb
const PORT = process.env.PORT || 3001; // Same PORT as defined in index.js originally

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  database.initDb((err) => {
    if (err) {
      console.error("Failed to initialize database:", err);
    } else {
      console.log("Database initialized successfully.");
    }
  });
});
