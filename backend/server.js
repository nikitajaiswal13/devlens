const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`DevLens backend listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start because the database connection failed.");
    process.exit(1);
  }
}

startServer();
