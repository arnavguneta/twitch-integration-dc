const mongoose = require('mongoose')

// Command to start db: /c/Users/arnav/mongodb/bin/mongod --dbpath=C:/Users/arnav/mongodb-data or sudo mongod --dbpath ~/data/db
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('Reconnected to MongoDB');
});
