import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hypernove SDK API',
      version: '1.0.0',
      description: 'API documentation for Hypernove SDK Whirlpool operations',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        PublicKey: {
          type: 'string',
          description: 'Solana public key string',
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./src/server.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options); 