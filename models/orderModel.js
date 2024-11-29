const database = require("../config/database");

class OrderModel {
  constructor() {
    this.collection = database.getCollection("orders");
    this.productCollection = database.getCollection("products");
    this.userCollection = database.getCollection("users");
  }

  // One-to-Many: User to Orders
  async createOrder(userId, cartItems) {
    try {
      // Validate cart items and check stock
      const orderItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await this.productCollection.findOne({
            _id: database.generateObjectId(item.productId),
          });

          if (!product || product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}`);
          }

          // Reduce product stock
          await this.productCollection.updateOne(
            { _id: product._id },
            { $inc: { stock: -item.quantity } }
          );

          return {
            productId: product._id,
            // name: product.name,
            quantity: item.quantity,
            price: product.price,
            subtotal: product.price * item.quantity,
          };
        })
      );

      // Calculate total order value
      const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

      // Create order document
      const orderDocument = {
        userId: database.generateObjectId(userId),
        items: orderItems,
        total,
        status: "PENDING",
        paymentStatus: "UNPAID",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await this.collection.insertOne(orderDocument);
      return result.insertedId;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  // One-to-One: Order to Payment
  async updateOrderPayment(orderId, paymentDetails) {
    try {
      return await this.collection.updateOne(
        { _id: database.generateObjectId(orderId) },
        {
          $set: {
            paymentStatus: paymentDetails.status,
            paymentMethod: paymentDetails.method,
            paymentTransactionId: paymentDetails.transactionId,
            updatedAt: new Date(),
          },
        }
      );
    } catch (error) {
      console.error("Error updating order payment:", error);
      throw error;
    }
  }

  // Get User Order History
  async getUserOrderHistory(userId) {
    try {
      // Convert userId to ObjectId if it's a string
      const userObjectId =
        typeof userId === "string" ? database.generateObjectId(userId) : userId;

      // Fetch orders for the specific user, sorted by creation date
      const orders = await this.collection
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 }) // Sort by most recent first
        .toArray();
      console.log(orders);

      return orders;
    } catch (error) {
      console.error("Error fetching order history:", error);
      throw error;
    }
  }

  // Get Specific Order Details with Product Information
  async getOrderDetails(orderId) {
    try {
      // Convert orderId to ObjectId if it's a string
      const orderObjectId =
        typeof orderId === "string"
          ? database.generateObjectId(orderId)
          : orderId;
      
      // Fetch the specific order
      const order = await this.collection.findOne({ _id: orderObjectId });

      if (!order) {
        return null;
      }

      // Populate product details for each item
      const enrichedOrder = {
        ...order,
        items: await Promise.all(
          order.items.map(async (item) => {
            const product = await this.productCollection.findOne({
              _id: item.productId,
            });
            return {
              ...item,
              productDetails: product,
            };
          })
        ),
      };

      return enrichedOrder;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  }
}

module.exports = new OrderModel();
