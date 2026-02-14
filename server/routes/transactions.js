const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const logActivity = require('../utils/logger');

// GET all transactions (with filters)
router.get('/', auth, roles('admin', 'warehouse_staff'), async (req, res) => {
    try {
        const query = {};
        if (req.query.type) query.type = req.query.type;
        if (req.query.item) query.item = req.query.item;
        if (req.query.project) query.project = req.query.project;
        if (req.query.startDate || req.query.endDate) {
            query.date = {};
            if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
            if (req.query.endDate) query.date.$lte = new Date(req.query.endDate);
        }
        if (req.query.isPaid === 'true') query.isPaid = true;
        if (req.query.isPaid === 'false') query.isPaid = false;
        if (req.query.paymentMethod) query.paymentMethod = req.query.paymentMethod;

        const transactions = await Transaction.find(query)
            .populate('item')
            .populate('project')
            .populate('user', 'email role') // Don't send password
            .sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id/payment', auth, roles('admin', 'warehouse_staff'), async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.type !== 'out') return res.status(400).json({ message: 'Payment can only be updated for stock out transactions' });

        const isPaid = Boolean(req.body.isPaid);
        if (isPaid) {
            const paymentMethod = req.body.paymentMethod;
            if (!paymentMethod) return res.status(400).json({ message: 'Payment method is required' });
            if (!['cash', 'gcash', 'bank_transfer', 'check', 'other'].includes(paymentMethod)) {
                return res.status(400).json({ message: 'Invalid payment method' });
            }
            transaction.isPaid = true;
            transaction.paymentMethod = paymentMethod;
            transaction.orNumber = req.body.orNumber || transaction.orNumber;
            transaction.paidAt = new Date();
        } else {
            transaction.isPaid = false;
            transaction.paymentMethod = undefined;
            transaction.orNumber = undefined;
            transaction.paidAt = undefined;
        }

        await transaction.save();
        const populated = await Transaction.findById(transaction._id)
            .populate('item')
            .populate('project')
            .populate('user', 'email role');
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// STOCK IN
router.post('/in', auth, roles('warehouse_staff', 'admin'), async (req, res) => {
    try {
        const item = await Item.findById(req.body.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const qty = Number(req.body.quantity);
        if (qty <= 0) return res.status(400).json({ message: 'Quantity must be positive' });

        // Update Item Stock
        item.quantity += qty;
        await item.save();

        // Create Transaction
        const transaction = new Transaction({
            type: 'in',
            item: item._id,
            quantity: qty,
            unit: item.unit,
            supplier: req.body.supplier,
            user: req.user.id
        });

        const newTransaction = await transaction.save();
        await logActivity(req.user.id, 'stock_in', `Added ${qty} ${item.unit} to ${item.name}`);
        res.status(201).json(newTransaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// STOCK OUT
router.post('/out', auth, roles('warehouse_staff', 'admin'), async (req, res) => {
    try {
        const item = await Item.findById(req.body.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const qty = Number(req.body.quantity);
        if (qty <= 0) return res.status(400).json({ message: 'Quantity must be positive' });

        if (item.quantity < qty) {
            return res.status(400).json({ message: `Insufficient stock. Available: ${item.quantity}` });
        }

        // Update Item Stock
        item.quantity -= qty;
        await item.save();

        // Create Transaction
        const transaction = new Transaction({
            type: 'out',
            item: item._id,
            quantity: qty,
            unit: item.unit,
            project: req.body.projectId,
            unitPrice: Number(item.price || 0),
            requestedBy: req.body.requestedBy,
            isPaid: req.body.isPaid || false,
            paymentMethod: req.body.paymentMethod || undefined,
            orNumber: req.body.orNumber,
            paidAt: req.body.isPaid ? new Date() : undefined,
            user: req.user.id
        });

        const newTransaction = await transaction.save();
        await logActivity(req.user.id, 'stock_out', `Issued ${qty} ${item.unit} of ${item.name} to project ${req.body.projectId}. Paid: ${req.body.isPaid ? 'Yes' : 'No'}`);
        res.status(201).json(newTransaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ADJUSTMENT
router.post('/adjust', auth, roles('admin'), async (req, res) => {
    try {
        const item = await Item.findById(req.body.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const newQty = Number(req.body.newQuantity);
        if (newQty < 0) return res.status(400).json({ message: 'Quantity cannot be negative' });

        const previousQty = item.quantity;
        
        // Update Item Stock
        item.quantity = newQty;
        await item.save();

        // Create Transaction
        const transaction = new Transaction({
            type: 'adjustment',
            item: item._id,
            quantity: Math.abs(newQty - previousQty), // Magnitude of change
            unit: item.unit,
            reason: req.body.reason,
            previousQuantity: previousQty,
            newQuantity: newQty,
            user: req.user.id
        });

        const newTransaction = await transaction.save();
        await logActivity(req.user.id, 'adjustment', `Adjusted ${item.name} from ${previousQty} to ${newQty}. Reason: ${req.body.reason}`);
        res.status(201).json(newTransaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
