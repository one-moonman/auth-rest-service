const mongoose = require('mongoose');

const connectMongoDB = async (db) => {
      try {
            await mongoose.connect(
                  process.env.MONGODB_URL,
                  {
                        useCreateIndex: true,
                        useUnifiedTopology: true,
                        useNewUrlParser: true,
                        useFindAndModify: false,
                  }
            );
            console.log("[✓] mongoDB connected");
      } catch (error) {
            console.log(error);
            process.exit(1);
      }
};

module.exports = connectMongoDB;
