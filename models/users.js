class User {
  static async createUser(db, userData) {
    return db.collection("users").insertOne(userData);
  }

  static async findByEmail(db, email) {
    return db.collection("users").findOne({ email });
  }
}

module.exports = User;
