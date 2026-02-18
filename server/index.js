require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory-db';
console.log(`Connecting to MongoDB at: ${mongoURI.includes('localhost') ? 'Localhost' : 'Atlas Cloud'}`);

mongoose.connect(mongoURI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
const authRouter = require('./routes/auth');
const itemsRouter = require('./routes/items');
const salesRouter = require('./routes/sales');
const categoriesRouter = require('./routes/categories');
const projectsRouter = require('./routes/projects');
const transactionsRouter = require('./routes/transactions');
const dashboardRouter = require('./routes/dashboard');
const reportsRouter = require('./routes/reports');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');
const activityLogsRouter = require('./routes/activityLogs');

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/activity-logs', activityLogsRouter);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
