// config/database.js
const { MongoClient } = require("mongodb");

class DatabaseConnection {
  constructor() {
    this.db = null;
    this.client = null;
    this.uri =
      process.env.MONGODB_URI ||
      "mongodb+srv://ArshpreetSingh:jY3PyvvQKRr9Us24@e-commweb.vc2jt.mongodb.net/?retryWrites=true&w=majority&appName=e-commWeb";

    this.options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
  }

  async connect() {
    if (this.db) return this.db;

    try {
      this.client = new MongoClient(this.uri, this.options);
      await this.client.connect();

      this.db = this.client.db(process.env.DB_NAME || "e-commWeb");

      // Test connection
      await this.db.command({ ping: 1 });
      console.log("MongoDB atlas connection established successfully");

      // Handle application termination
      process.on("SIGINT", async () => {
        await this.close();
      });
      const Product = require("../models/Product");
      await Product.seedProducts(this.db);
      return this.db;
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error("Database not initialized. Call connect() first.");
    }
    return this.db;
  }

  getCollection(collectionName) {
    const db = this.getDb();
    return db.collection(collectionName);
  }

  generateObjectId(id) {
    const { ObjectId } = require("mongodb");
    return new ObjectId(id);
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.db = null;
      this.client = null;
      console.log("Database connection closed");
    }
  }

  async initializeIndexes() {
    const db = this.getDb();

    try {
      // Users collection indexes
      await db.collection("users").createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { username: 1 }, unique: true },
      ]);

      // Products collection indexes
      await db
        .collection("products")
        .createIndexes([
          { key: { pname: 1 } },
          { key: { price: 1 } },
          { key: { categories: 1 } },
        ]);

      // Orders collection indexes
      await db
        .collection("orders")
        .createIndexes([
          { key: { userId: 1 } },
          { key: { status: 1 } },
          { key: { createdAt: 1 } },
        ]);

      // Carts collection indexes
      await db
        .collection("carts")
        .createIndexes([
          { key: { userId: 1 }, unique: true },
          { key: { updatedAt: 1 } },
        ]);

      console.log("Database indexes initialized successfully");
    } catch (err) {
      console.error("Error initializing database indexes:", err);
      throw err;
    }
  }
}

module.exports = new DatabaseConnection();
