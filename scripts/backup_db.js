const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Book = require('../backend/src/models/Book');
const User = require('../backend/src/models/User');
const Order = require('../backend/src/models/Order');
require('../backend/src/config/env');

const backupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    const data = {
      timestamp: new Date().toISOString(),
      books: await Book.find({}),
      users: await User.find({}).select('-password'),
      orders: await Order.find({}),
    };

    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
    console.log(`Backup saved to ${backupFile}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
};

backupDatabase();

