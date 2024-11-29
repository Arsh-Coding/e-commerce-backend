const Product = require("../models/Product");

class ProductController {
  static async getAllProducts(req, res) {
    try {
      const products = await Product.findAll(req.db);
      res.render("home", {
        products,
        isAuthenticated: req.user ? true : false,
      });
    } catch (error) {
      res.status(500).render("error", { error: error.message });
    }
  }

  static async getProductDetails(req, res) {
    try {
      const product = await Product.findById(req.db, req.params.id);
      if (!product) {
        return res.status(404).render("error", { error: "Product not found" });
      }
      res.render("product", {
        product,
        isAuthenticated: req.user ? true : false,
      });
    } catch (error) {
      res.status(500).render("error", { error: error.message });
    }
  }

  // API methods for JSON responses
  static async getProductsJson(req, res) {
    try {
      const products = await Product.findAll(req.db);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Error fetching products" });
    }
  }

  static async getProductJson(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Error fetching product details" });
    }
  }
}

module.exports = ProductController;
