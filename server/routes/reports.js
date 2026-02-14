const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

function toCSV(rows, headers) {
  const h = headers.join(',');
  const b = rows.map(r => headers.map(k => (r[k] ?? '')).join(',')).join('\n');
  return `${h}\n${b}`;
}

router.get('/inventory', auth, roles('admin', 'warehouse_staff'), async (req, res) => {
  try {
    const items = await Item.find().populate('category').sort({ name: 1 });
    if (req.query.format === 'csv') {
      const rows = items.map(i => ({
        name: i.name,
        itemCode: i.itemCode || '',
        category: i.category ? i.category.name : '',
        unit: i.unit,
        quantity: i.quantity,
        price: i.price
      }));
      const csv = toCSV(rows, ['name', 'itemCode', 'category', 'unit', 'quantity', 'price']);
      res.header('Content-Type', 'text/csv');
      return res.send(csv);
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stock-in', auth, roles('admin', 'warehouse_staff'), async (req, res) => {
  try {
    const data = await Transaction.find({ type: 'in' }).sort({ date: -1 }).populate('item user');
    if (req.query.format === 'csv') {
      const rows = data.map(t => ({
        date: t.date.toISOString(),
        item: t.item ? t.item.name : '',
        quantity: t.quantity,
        unit: t.unit,
        supplier: t.supplier || '',
        user: t.user ? t.user.email : ''
      }));
      const csv = toCSV(rows, ['date', 'item', 'quantity', 'unit', 'supplier', 'user']);
      res.header('Content-Type', 'text/csv');
      return res.send(csv);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stock-out', auth, roles('admin', 'warehouse_staff'), async (req, res) => {
  try {
    const data = await Transaction.find({ type: 'out' }).sort({ date: -1 }).populate('item user project');
    if (req.query.format === 'csv') {
      const rows = data.map(t => ({
        date: t.date.toISOString(),
        item: t.item ? t.item.name : '',
        quantity: t.quantity,
        unit: t.unit,
        project: t.project ? t.project.name : '',
        requestedBy: t.requestedBy || '',
        approvedBy: t.approvedBy || '',
        user: t.user ? t.user.email : ''
      }));
      const csv = toCSV(rows, ['date', 'item', 'quantity', 'unit', 'project', 'requestedBy', 'approvedBy', 'user']);
      res.header('Content-Type', 'text/csv');
      return res.send(csv);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/low-stock', auth, roles('admin', 'warehouse_staff'), async (req, res) => {
  try {
    const items = await Item.find().sort({ name: 1 });
    const low = items.filter(i => i.quantity <= (i.minStock || 0));
    if (req.query.format === 'csv') {
      const rows = low.map(i => ({
        name: i.name,
        itemCode: i.itemCode || '',
        quantity: i.quantity,
        minStock: i.minStock || 0
      }));
      const csv = toCSV(rows, ['name', 'itemCode', 'quantity', 'minStock']);
      res.header('Content-Type', 'text/csv');
      return res.send(csv);
    }
    res.json(low);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/usage-by-project', auth, roles('admin', 'warehouse_staff'), async (req, res) => {
  try {
    const match = { type: 'out' };
    if (req.query.startDate || req.query.endDate) {
        match.date = {};
        if (req.query.startDate) match.date.$gte = new Date(req.query.startDate);
        if (req.query.endDate) match.date.$lte = new Date(req.query.endDate);
    }
    if (req.query.projectId) {
        match.project = new mongoose.Types.ObjectId(req.query.projectId);
    }

    const usage = await Transaction.aggregate([
        { $match: match },
        { $group: {
            _id: { project: "$project", item: "$item" },
            totalQuantity: { $sum: "$quantity" }
        }},
        { $lookup: { from: "projects", localField: "_id.project", foreignField: "_id", as: "projectDetails" } },
        { $lookup: { from: "items", localField: "_id.item", foreignField: "_id", as: "itemDetails" } },
        { $unwind: { path: "$projectDetails", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$itemDetails", preserveNullAndEmptyArrays: true } },
        { $project: {
            _id: 0,
            projectDetails: 1,
            itemDetails: 1,
            totalQuantity: 1
        }}
    ]);
    res.json(usage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
