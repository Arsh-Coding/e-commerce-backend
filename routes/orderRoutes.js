// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const OrderModel = require("../models/orderModel");
const OrderController = require("../controllers/orderController");
// const authMiddleware = require("../middleware/auth");

const authMiddleware = (req, res, next) => {
  // For development, you might want to simulate a user
  req.user = {
    _id: "674602432aa74881da4b5036", // Replace with an actual user ID from your database
  };
  next();
};

router.post("/create", authMiddleware, async (req, res) => {
  // authMiddleware.isAuthenticated
  try {
    console.log("Order creation request received:", req.body);

    // Ensure user is logged in (for now, we're using the temporary middleware)
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { cartItems } = req.body;

    // Validate cart items
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "Invalid cart items" });
    }

    // Create order
    const orderId = await OrderModel.createOrder(req.user._id, cartItems);

    res.status(201).json({
      message: "Order created successfully",
      orderId: orderId,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      error: "Failed to create order",
      details: error.message,
    });
  }
});
// Get Order History (Protected Route)
// router.get("/history", authMiddleware, async (req, res) => {
//   try {
//     const orders = await OrderModel.getUserOrderHistory(req.user.id);
//     res.render("order", { orders });
//   } catch (error) {
//     res.status(500).send("Error fetching order history");
//   }
// });
router.get("/history", authMiddleware, OrderController.getOrderHistory);

// Get Specific Order Details (Protected Route)
router.get("/:orderId", authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Fetch order details from the database
    // console.log(orderId);
    const order = await OrderModel.getOrderDetails(orderId);
    console.log(order);

    if (!order) {
      console.log("Order Not found");
      // return res.status(404).send("Order not found");
    }

    // Render the view with the order data
    res.render("paymentCheckout", { order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).send("Error fetching order details");
  }
});

router.get("/process", async (req, res) => {
  const orderId = req.params.orderId; // Assuming orderId is passed as a query parameter
  console.log("The order id for confirmation page is->" + orderId);

  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    // Fetch the order details
    const order = await OrderModel.getUserOrderHistory(orderId);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Render the orderConfirmation view with the order details
    res.render("orderConfirmation", { order });
  } catch (error) {
    res.render("orderConfirmation");
  }
});

module.exports = router;
