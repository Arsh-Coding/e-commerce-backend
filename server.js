const express = require("express");
const path = require("path");
const database = require("./config/database");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Database connection and initialization
async function startServer() {
  try {
    // Connect to database
    await database.connect();

    // Initialize indexes
    await database.initializeIndexes();

    // Middleware to attach db to req
    app.use((req, res, next) => {
      req.db = database.getDb(); // Assuming getDb() returns the database connection
      next();
    });

    // Routes
    const productRoutes = require("./routes/productRoutes");
    const cartRoutes = require("./routes/cartRoutes");
    const authRoutes = require("./routes/authRoutes");
    // const paymentRoutes = require("./routes/paymentRoutes");
    const orderRoutes = require("./routes/orderRoutes");
    const confirmRoutes = require("./routes/confirmRoutes");

    app.use("/auth", authRoutes);
    app.use("/confirm", confirmRoutes);
    app.use("/", productRoutes);
    app.use("/", cartRoutes);
    app.use("/", authRoutes);
    // app.use("/payment", paymentRoutes);
    app.use("/orders", orderRoutes);

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Call the async function to start the server
startServer();
