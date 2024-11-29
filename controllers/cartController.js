const Cart = require("../models/cart");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/database");

const cartController = {
  // Display cart page
  async showCart(req, res) {
    try {
      let cartItems = [];
      let total = 0;

      if (req.user) {
        // Logged in user - get cart from database
        const cart = await Cart.getByUserId(req.user._id);
        if (cart) {
          cartItems = cart.items;
          total = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
        }
      }

      res.render("cart", {
        cartItems,
        total,
        user: req.user,
      });
    } catch (error) {
      console.error("Show cart error:", error);
      res.status(500).render("error", { message: "Error loading cart" });
    }
  },

  // Add item to cart
  async addToCart(req, res) {
    try {
      const { productId, quantity } = req.body;

      if (req.user) {
        // Logged in user - add to database
        const cart = await Cart.addItem(
          req.user._id,
          productId,
          parseInt(quantity)
        );
        res.json({ success: true, cart });
      } else {
        // Guest user - return success to handle in frontend
        res.json({ success: true, message: "Add to local storage" });
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Remove item from cart
  async removeFromCart(req, res) {
    try {
      const { productId } = req.params;

      if (req.user) {
        // Logged in user - remove from database
        const cart = await Cart.removeItem(req.user._id, productId);
        res.json({ success: true, cart });
      } else {
        // Guest user - return success to handle in frontend
        res.json({ success: true, message: "Remove from local storage" });
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Update item quantity
  async updateQuantity(req, res) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;

      if (req.user) {
        // Logged in user - update in database
        const cart = await Cart.updateQuantity(
          req.user._id,
          productId,
          parseInt(quantity)
        );
        res.json({ success: true, cart });
      } else {
        // Guest user - return success to handle in frontend
        res.json({ success: true, message: "Update in local storage" });
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Clear cart
  async clearCart(req, res) {
    try {
      if (req.user) {
        // Logged in user - clear database cart
        const cart = await Cart.clear(req.user._id);
        res.json({ success: true, cart });
      } else {
        // Guest user - return success to handle in frontend
        res.json({ success: true, message: "Clear local storage" });
      }
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Merge local cart with database cart after login
  async mergeCart(req, res) {
    try {
      const { localCart } = req.body;
      const cart = await Cart.mergeWithLocal(req.user._id, localCart);
      res.json({ success: true, cart });
    } catch (error) {
      console.error("Merge cart error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = cartController;
