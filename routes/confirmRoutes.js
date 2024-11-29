const express = require("express");
const router = express.Router();

router.get("/confirmOrder", (req, res) => {
  // You might want to pass order details from a session or database
  res.render("orderConfirmation", {
    orderNumber: Math.floor(Math.random() * 1000000),
    orderDate: new Date().toLocaleDateString(),
  });
});

module.exports = router;
