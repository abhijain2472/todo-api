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
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the todo (UUID)
 *         title:
 *           type: string
 *           description: The title of the todo
 *         completed:
 *           type: boolean
 *           description: The status of the todo
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of soft deletion
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         version:
 *           type: number
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
 *             $ref: '#/components/schemas/Todo'
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
 * /todos/{id}:
 *   patch:
 *     summary: Update a todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The todo id
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
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The todo id
 *     responses:
 *       200:
 *         description: The todo was deleted
 */

router.get('/', getTodos);
router.get('/sync', syncTodos);
router.post('/', createTodo);
router.patch('/:id', updateTodo);
router.delete('/:id', deleteTodo);

module.exports = router;
