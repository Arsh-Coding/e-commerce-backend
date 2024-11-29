const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { attachUser } = require("../middleware/auth");

// Attach user to all cart routes
router.use(attachUser);

// Show cart page
router.get("/cart", cartController.showCart);

// Add item to cart
router.post("/cart/add", cartController.addToCart);

// Remove item from cart
router.delete("cart/remove/:productId", cartController.removeFromCart);

// Update item quantity
router.put("cart/update/:productId", cartController.updateQuantity);

// Clear cart
router.delete("cart/clear", cartController.clearCart);

// Merge local cart with database cart
router.post("cart/merge", cartController.mergeCart);

module.exports = router;
