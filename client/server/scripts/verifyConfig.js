const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verify() {
  try {
    await mongoose.connect(process.env.USER_MONGO_URI);
    const result = await mongoose.connection.db.collection('systemconfigs').findOne({});
    console.log(JSON.stringify(result, null, 2));
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

verify();
