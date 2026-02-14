const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// GET all projects
router.get('/', auth, async (req, res) => {
    try {
        const query = {};
        if (req.user.role === 'site_engineer') {
            query.engineer = req.user.id;
        }

        const projects = await Project.find(query)
            .populate('engineer', 'email role')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single project
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('engineer', 'email role');
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (req.user.role === 'site_engineer') {
            if (!project.engineer || project.engineer._id.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a project
router.post('/', auth, roles('admin'), async (req, res) => {
    try {
        let engineerId = req.body.engineerId || req.body.engineer;
        let engineerUser = null;

        if (engineerId) {
            engineerUser = await User.findById(engineerId).select('email role');
            if (!engineerUser) return res.status(400).json({ message: 'Invalid engineer' });
            if (engineerUser.role !== 'site_engineer') return res.status(400).json({ message: 'Assigned user is not a site engineer' });
        }

        const project = new Project({
            name: req.body.name,
            location: req.body.location,
            coordinates: req.body.coordinates, // { lat, lng }
            manager: req.body.manager || (engineerUser ? engineerUser.email : undefined),
            engineer: engineerUser ? engineerUser._id : undefined,
            status: req.body.status
        });

        const newProject = await project.save();
        const populated = await Project.findById(newProject._id).populate('engineer', 'email role');
        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a project
router.put('/:id', auth, roles('admin'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (req.body.name) project.name = req.body.name;
        if (req.body.location) project.location = req.body.location;
        if (req.body.manager) project.manager = req.body.manager;
        if (req.body.status) project.status = req.body.status;
        if (req.body.coordinates) project.coordinates = req.body.coordinates;

        if (req.body.engineerId !== undefined || req.body.engineer !== undefined) {
            const engineerId = req.body.engineerId || req.body.engineer;
            if (!engineerId) {
                project.engineer = undefined;
            } else {
                const engineerUser = await User.findById(engineerId).select('email role');
                if (!engineerUser) return res.status(400).json({ message: 'Invalid engineer' });
                if (engineerUser.role !== 'site_engineer') return res.status(400).json({ message: 'Assigned user is not a site engineer' });
                project.engineer = engineerUser._id;
                if (!req.body.manager) project.manager = engineerUser.email;
            }
        }

        const updatedProject = await project.save();
        const populated = await Project.findById(updatedProject._id).populate('engineer', 'email role');
        res.json(populated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a project
router.delete('/:id', auth, roles('admin'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        
        await project.deleteOne();
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
