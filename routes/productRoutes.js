// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productController");

// Home page with all products
router.get("/", ProductController.getAllProducts);

// Single product page
router.get("/product/:id", ProductController.getProductDetails);
// API Routes
// Get product data as JSON for cart
router.get("/api/products", ProductController.getProductsJson);
router.get("/api/product/:id", ProductController.getProductJson);

module.exports = router;
