require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Item = require('./models/Item');

const seedDemoInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory-db');
    console.log('MongoDB connected');

    const categoryName = 'Demo Materials';
    let category = await Category.findOne({ name: categoryName });
    if (!category) {
      category = await Category.create({ name: categoryName, description: 'Demo items for ordering' });
      console.log('Category created:', category.name);
    } else {
      console.log('Category exists:', category.name);
    }

    const items = [
      { itemCode: 'DEMO-CEM', name: 'Portland Cement', unit: 'pack', price: 250, quantity: 100, minStock: 10 },
      { itemCode: 'DEMO-RBR', name: '12mm Rebar', unit: 'piece', price: 180, quantity: 300, minStock: 30 },
      { itemCode: 'DEMO-SND', name: 'Sand', unit: 'kg', price: 25, quantity: 1000, minStock: 100 }
    ];

    for (const it of items) {
      const existing = await Item.findOne({ itemCode: it.itemCode });
      if (existing) {
        existing.name = it.name;
        existing.unit = it.unit;
        existing.price = it.price;
        existing.quantity = it.quantity;
        existing.minStock = it.minStock;
        existing.category = category._id;
        await existing.save();
        console.log('Item updated:', existing.itemCode);
      } else {
        await Item.create({ ...it, category: category._id });
        console.log('Item created:', it.itemCode);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDemoInventory();
