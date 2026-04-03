const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Try to find the .env file in backend/
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function findUsers() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const targetEmails = [
            'snehakumari83832@gmail.com',
            'entertainment@gmail.com',
            'sports@gmail.com',
            'lifesyle@gmail.com'
        ];

        const users = await User.find({ email: { $in: targetEmails } });
        console.log("USERS_START");
        console.log(JSON.stringify(users, null, 2));
        console.log("USERS_END");

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findUsers();
