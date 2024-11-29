const { ObjectId } = require("mongodb");
const { getDb } = require("../config/database");

class Cart {
  constructor(userId = null) {
    this.userId = userId;
    this.items = [];
    this.updatedAt = new Date();
  }

  // Create new cart
  static async create(userId) {
    const db = getDb();
    const cart = new Cart(userId);
    const result = await db.collection("carts").insertOne(cart);
    return result.insertedId;
  }

  // Get cart by user ID
  static async getByUserId(userId) {
    const db = getDb();
    return await db
      .collection("carts")
      .findOne({ userId: new ObjectId(userId) });
  }

  // Add item to cart
  static async addItem(userId, productId, quantity) {
    const db = getDb();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });

    if (!product) throw new Error("Product not found");
    if (product.stock < quantity) throw new Error("Insufficient stock");

    const cart = await this.getByUserId(userId);
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      await db.collection("carts").updateOne(
        {
          userId: new ObjectId(userId),
          "items.productId": new ObjectId(productId),
        },
        {
          $inc: { "items.$.quantity": quantity },
          $set: { updatedAt: new Date() },
        }
      );
    } else {
      // Add new item
      await db.collection("carts").updateOne(
        { userId: new ObjectId(userId) },
        {
          $push: {
            items: {
              productId: new ObjectId(productId),
              quantity: quantity,
              name: product.name,
              price: product.price,
            },
          },
          $set: { updatedAt: new Date() },
        }
      );
    }
    return await this.getByUserId(userId);
  }

  // Remove item from cart
  static async removeItem(userId, productId) {
    const db = getDb();
    await db.collection("carts").updateOne(
      { userId: new ObjectId(userId) },
      {
        $pull: { items: { productId: new ObjectId(productId) } },
        $set: { updatedAt: new Date() },
      }
    );
    return await this.getByUserId(userId);
  }

  // Update item quantity
  static async updateQuantity(userId, productId, quantity) {
    const db = getDb();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });

    if (!product) throw new Error("Product not found");
    if (product.stock < quantity) throw new Error("Insufficient stock");

    await db.collection("carts").updateOne(
      {
        userId: new ObjectId(userId),
        "items.productId": new ObjectId(productId),
      },
      {
        $set: {
          "items.$.quantity": quantity,
          updatedAt: new Date(),
        },
      }
    );
    return await this.getByUserId(userId);
  }

  // Clear cart
  static async clear(userId) {
    const db = getDb();
    await db.collection("carts").updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          items: [],
          updatedAt: new Date(),
        },
      }
    );
    return await this.getByUserId(userId);
  }

  // Merge local storage cart with database cart
  static async mergeWithLocal(userId, localItems) {
    const db = getDb();
    const cart = await this.getByUserId(userId);

    for (const localItem of localItems) {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === localItem.productId
      );

      if (existingItem) {
        await this.updateQuantity(
          userId,
          localItem.productId,
          existingItem.quantity + localItem.quantity
        );
      } else {
        await this.addItem(userId, localItem.productId, localItem.quantity);
      }
    }
    return await this.getByUserId(userId);
  }
}

module.exports = Cart;
