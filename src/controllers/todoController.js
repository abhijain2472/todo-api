const Todo = require('../models/Todo');

// @desc    Get all active todos (not deleted)
// @route   GET /api/todos
// @access  Public
const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ deletedAt: null }).sort({ createdAt: -1 });
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get changes for synchronization
// @route   GET /api/todos/sync
// @access  Public
const syncTodos = async (req, res) => {
    try {
        const { since } = req.query; // Timestamp string or epoch
        let query = {};

        if (since) {
            const sinceDate = new Date(since);
            if (!isNaN(sinceDate)) {
                // Fetch items updated/created/deleted AFTER 'since'
                query = { updatedAt: { $gt: sinceDate } };
            }
        }

        // Return all matching items, INCLUDING deleted ones so client knows to remove them
        const todos = await Todo.find(query).sort({ updatedAt: 1 });

        res.status(200).json({
            timestamp: new Date().toISOString(), // Current server time for next sync
            changes: todos,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Public
const createTodo = async (req, res) => {
    try {
        const todo = await Todo.create(req.body);
        res.status(201).json(todo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a todo
// @route   PATCH /api/todos/:id
// @access  Public
const updateTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // If it was softly deleted, you might want to allow "undeleting" it via update,
        // or block updates. Assuming we allow updates to revive or modify:
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Returns the updated document
        );

        res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Soft delete a todo
// @route   DELETE /api/todos/:id
// @access  Public
const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Soft delete: set deletedAt
        todo.deletedAt = new Date();
        await todo.save();

        res.status(200).json({ id: todo._id, message: 'Todo soft deleted', deletedAt: todo.deletedAt });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTodos,
    syncTodos,
    createTodo,
    updateTodo,
    deleteTodo,
};
