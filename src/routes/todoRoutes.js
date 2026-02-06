const express = require('express');
const router = express.Router();
const {
    getTodos,
    syncTodos,
    createTodo,
    updateTodo,
    deleteTodo,
} = require('../controllers/todoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - syncId
 *         - title
 *       properties:
 *         syncId:
 *           type: string
 *           description: Client-generated unique identifier (UUID v4 recommended)
 *         title:
 *           type: string
 *           description: The title of the todo
 *         description:
 *           type: string
 *           description: Optional description of the todo
 *         isCompleted:
 *           type: boolean
 *           description: Whether the todo is completed
 *           default: false
 *         isDeleted:
 *           type: boolean
 *           description: Soft deletion flag (tombstone)
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the todo was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the todo was last updated
 *         version:
 *           type: number
 *           description: Version number for conflict resolution
 *           default: 1
 *     TodoCreate:
 *       type: object
 *       required:
 *         - syncId
 *         - title
 *       properties:
 *         syncId:
 *           type: string
 *           description: Client-generated unique identifier (UUID v4)
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         title:
 *           type: string
 *           description: The title of the todo
 *           example: "Buy groceries"
 *         description:
 *           type: string
 *           description: Optional description
 *           example: "Milk, eggs, bread"
 *         isCompleted:
 *           type: boolean
 *           default: false
 */

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: The todos managing API
 */

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Returns the list of all active todos
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: The list of the active todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoCreate'
 *     responses:
 *       201:
 *         description: The created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */

/**
 * @swagger
 * /todos/sync:
 *   get:
 *     summary: Get changes for synchronization
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: since
 *         schema:
 *           type: string
 *         description: ISO date string to fetch changes after
 *     responses:
 *       200:
 *         description: List of changes (created, updated, deleted)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 changes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 */

/**
 * @swagger
 * /todos/{syncId}:
 *   patch:
 *     summary: Update a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: syncId
 *         schema:
 *           type: string
 *         required: true
 *         description: The client-generated sync identifier (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       200:
 *         description: The updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *   delete:
 *     summary: Soft delete a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: syncId
 *         schema:
 *           type: string
 *         required: true
 *         description: The client-generated sync identifier (UUID)
 *     responses:
 *       200:
 *         description: The todo was deleted
 */

router.get('/', getTodos);
router.get('/sync', syncTodos);
router.post('/', createTodo);
router.patch('/:syncId', updateTodo);
router.delete('/:syncId', deleteTodo);

module.exports = router;
