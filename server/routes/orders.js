const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const logActivity = require('../utils/logger');

// GET all orders (Admin/Staff) or My Orders (User)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        const { view } = req.query;

        console.log(`GET /orders - User: ${req.user.email} (${req.user.role}), View: ${view}`);

        // 1. Admin/Warehouse: Can see ALL orders
        if (req.user.role === 'admin' || req.user.role === 'warehouse_staff') {
             // If they specifically asked for 'mine', show their own (unlikely but possible)
             if (view === 'mine') {
                 query.user = req.user.id;
             }
             // Otherwise, query stays empty {} -> fetch all
        }
        // 2. Delivery Personnel: See orders assigned to them OR unassigned delivery orders (optional, depending on policy)
        // For now, let's say they see orders assigned to them
        else if (req.user.role === 'delivery') {
            console.log(`Delivery User ${req.user.id} fetching assigned orders`);
            // STRICT QUERY: Only show orders where assignedTo matches their ID
            query.assignedTo = req.user.id;
        }
        // 3. Client: See only their own orders
        else {
            if (req.user.role === 'site_engineer') {
                const projects = await Project.find({ engineer: req.user.id }).select('_id');
                const projectIds = projects.map(p => p._id);
                query.project = { $in: projectIds };

                if (view === 'deliveries') {
                    query.type = 'delivery';
                    query.status = { $ne: 'cancelled' };
                }
            } else {
                query.user = req.user.id;
            }
        }

        console.log('Query:', query);

        const orders = await Order.find(query)
            .populate('user', 'email')
            .populate('project', 'name location')
            .populate('items.item')
            .populate('assignedTo', 'email') // Populate delivery guy info
            .sort({ createdAt: -1 });
        
        console.log(`Found ${orders.length} orders`);
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'email')
            .populate('project', 'name location engineer')
            .populate('items.item');
        
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Access control
        if (req.user.role === 'admin' || req.user.role === 'warehouse_staff') {
            return res.json(order);
        }

        if (req.user.role === 'delivery') {
            if (!order.assignedTo || order.assignedTo.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            return res.json(order);
        }

        if (req.user.role === 'site_engineer') {
            const projectId = typeof order.project === 'object' && order.project ? order.project._id : order.project;
            if (!projectId) return res.status(403).json({ message: 'Access denied' });
            const canAccess = await Project.exists({ _id: projectId, engineer: req.user.id });
            if (!canAccess) return res.status(403).json({ message: 'Access denied' });
            return res.json(order);
        }

        if (order.user && order.user._id && order.user._id.toString() === req.user.id) {
            return res.json(order);
        }

        return res.status(403).json({ message: 'Access denied' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE Order
router.post('/', auth, async (req, res) => {
    try {
        const { items, type, deliveryAddress, notes } = req.body;
        const projectId = req.body.projectId || req.body.project;

        if (req.user.role === 'site_engineer') {
            if (!projectId) return res.status(400).json({ message: 'Project is required' });
            const assignedProject = await Project.findOne({ _id: projectId, engineer: req.user.id }).select('_id');
            if (!assignedProject) return res.status(403).json({ message: 'Project not assigned to you' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate stock and calculate total
        for (let i of items) {
            const item = await Item.findById(i.item);
            if (!item) return res.status(404).json({ message: `Item not found: ${i.item}` });
            
            if (item.quantity < i.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${item.quantity}` });
            }

            // Deduct stock immediately (Reserve)
            item.quantity -= i.quantity;
            await item.save();

            // Create Transaction Record (Stock Out)
            const transaction = new Transaction({
                item: item._id,
                type: 'out',
                quantity: i.quantity,
                user: req.user.id,
                unit: item.unit,
                unitPrice: Number(item.price || 0),
                reason: `Order ${type || 'standard'}`,
                project: projectId
            });
            await transaction.save();

            orderItems.push({
                item: item._id,
                quantity: i.quantity,
                priceAtOrder: item.price
            });
            totalAmount += (item.price || 0) * i.quantity;
        }

        const order = new Order({
            user: req.user.id,
            project: projectId,
            items: orderItems,
            type,
            deliveryAddress: type === 'delivery' ? deliveryAddress : undefined,
            location: type === 'delivery' ? req.body.location : undefined,
            totalAmount,
            notes,
            status: 'confirmed' // Auto-confirm internal orders or keep pending? Let's keep pending for workflow, or confirmed if it's "Stock Out"
        });

        const newOrder = await order.save();
        await logActivity(req.user.id, 'order_created', `Created order ${newOrder._id} (${type})`);

        const populated = await Order.findById(newOrder._id)
            .populate('user', 'email')
            .populate('project', 'name location')
            .populate('items.item')
            .populate('assignedTo', 'email');
        
        res.status(201).json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// UPDATE Order Status or Assign Delivery
router.put('/:id/status', auth, roles('admin', 'warehouse_staff', 'delivery'), async (req, res) => {
    try {
        const { status, assignedTo } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // If assigning a delivery person (Admin/Staff only)
        if (assignedTo) {
            console.log(`Assigning order ${order._id} to ${assignedTo}`);
            if (req.user.role !== 'admin' && req.user.role !== 'warehouse_staff') {
                return res.status(403).json({ message: 'Only admins can assign deliveries' });
            }
            order.assignedTo = assignedTo;
            await logActivity(req.user.id, 'order_assign', `Assigned order ${order._id} to user ${assignedTo}`);
        }

        // If updating status
        if (status) {
            const oldStatus = order.status;
            
            // Handle Cancellation (Restock items)
            if (status === 'cancelled' && oldStatus !== 'cancelled') {
                for (let i of order.items) {
                    const item = await Item.findById(i.item);
                    if (item) {
                        item.quantity += i.quantity;
                        await item.save();
                    }
                }
            }

            order.status = status;
            await logActivity(req.user.id, 'order_update', `Updated order ${order._id} status to ${status}`);
        }

        order.updatedAt = Date.now();
        await order.save();
        
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
