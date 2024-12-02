const OrderModel = require("../models/orderModel");


class OrderController {
  // Get Order History
  static async getOrderHistory(req, res) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).render("error", {
          error: "Please log in to view order history",
        });
      }

      // Fetch user's order history
      const orders = await OrderModel.getUserOrderHistory(req.user._id);

      // Render order history page
      res.render("order", {
        orders,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Order history retrieval error:", error);
      res.status(500).render("error", {
        error: "Failed to retrieve order history",
      });
    }
  }

  // Get Order Details
  static async getOrderDetails(req, res) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).render("error", {
          error: "Please log in to view order details",
        });
      }

      // Get order ID from request parameters
      const orderId = req.params.id;

      // Fetch order details
      const order = await OrderModel.getOrderDetails(orderId);

      // Check if order exists and belongs to the user
      if (!order || !order.userId.equals(req.user._id)) {
        return res.status(404).render("error", {
          error: "Order not found",
        });
      }

      // Render order details page
      res.render("order-details", {
        order,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Order details retrieval error:", error);
      res.status(500).render("error", {
        error: "Failed to retrieve order details",
      });
    }
  }
}

module.exports = OrderController;
