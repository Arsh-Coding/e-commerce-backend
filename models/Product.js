// models/Product.js
const { ObjectId } = require("mongodb");

class Product {
  static async findAll(db) {
    try {
      return await db.collection("products").find({}).toArray();
    } catch (error) {
      throw new Error("Error fetching products: " + error.message);
    }
  }

  static async findById(db, id) {
    try {
      return await db.collection("products").findOne({ _id: new ObjectId(id) });
    } catch (error) {
      throw new Error("Error fetching product: " + error.message);
    }
  }

  static async create(db, productData) {
    try {
      const result = await db.collection("products").insertOne(productData);
      return result.insertedId;
    } catch (error) {
      throw new Error("Error creating product: " + error.message);
    }
  }

  // Method to seed initial products
  static async seedProducts(db) {
    try {
      const existingProducts = await this.findAll(db);
      if (existingProducts.length === 0) {
        const products = [
          {
            name: "Smartphone X",
            description: "Latest smartphone with advanced features",
            price: 999.99,
            stock: 50,
            imageUrl: "./images/smartphone.png",
            categories: "Electronics",
          },
          {
            name: "Laptop Pro",
            description: "High-performance laptop for professionals",
            price: 1499.99,
            stock: 30,
            imageUrl: "./images/laptop.png",
            categories: "Electronics",
          },
          // Add more products here...
        ];
        await db.collection("products").insertMany(products);
        console.log("Products seeded successfully");
      }
    } catch (error) {
      throw new Error("Error seeding products: " + error.message);
    }
  }
}

module.exports = Product;
