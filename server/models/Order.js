const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    items: [{
        item: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Item', 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true 
        },
        priceAtOrder: { 
            type: Number 
        }
    }],
    type: { 
        type: String, 
        enum: ['pickup', 'delivery'], 
        required: true 
    },
    deliveryAddress: { 
        type: String 
    },
    location: {
        lat: Number,
        lng: Number
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {  
        type: String, 
        enum: ['pending', 'confirmed', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    totalAmount: { 
        type: Number, 
        default: 0 
    },
    notes: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Order', OrderSchema);
