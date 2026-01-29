const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Offline-First Todo API',
            version: '1.0.0',
            description: 'A simple Express Todo API designed for offline-first applications',
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
