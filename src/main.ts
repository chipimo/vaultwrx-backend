// Load environment variables FIRST, before any other imports
import * as dotenv from 'dotenv';
import * as path from 'path';

// Determine the root directory (where .env file is located)
// When running from dist, __dirname will be dist/, so we need to go up one level
const rootDir = __dirname.includes('dist') ? path.resolve(__dirname, '..') : __dirname;
dotenv.config({ path: path.join(rootDir, '.env') });

// Also try loading environment-specific .env files
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.join(rootDir, `.env.${nodeEnv}`) });

import 'reflect-metadata';
import { fixModuleAlias } from './utils/fix-module-alias';
fixModuleAlias(__dirname);
import { appConfig } from '@base/config/app';
import { loadEventDispatcher } from '@base/utils/load-event-dispatcher';
import { useContainer as routingControllersUseContainer, useExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { loadHelmet } from '@base/utils/load-helmet';
import { Container } from 'typedi';
import { createConnection, useContainer as typeormOrmUseContainer } from 'typeorm';
import { Container as containerTypeorm } from 'typeorm-typedi-extensions';
import { useSocketServer, useContainer as socketUseContainer } from 'socket-controllers';
import { registerController as registerCronJobs, useContainer as cronUseContainer } from 'cron-decorators';
import express from 'express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUiExpress from 'swagger-ui-express';
import { buildSchema } from 'type-graphql';
import bodyParser from 'body-parser';
import { dbConfig } from '@base/config/db';

export class App {
  public app: express.Application = express();
  private port: Number = appConfig.port;

  public constructor() {
    this.bootstrap();
  }

  public async bootstrap() {
    this.useContainers();
    await this.typeOrmCreateConnection();
    this.registerEvents();
    this.registerCronJobs();
    this.serveStaticFiles();
    this.setupMiddlewares();
    this.registerSocketControllers();
    this.registerRoutingControllers();
    this.registerDefaultHomePage();
    this.setupSwagger();
    await this.setupGraphQL();
    // this.register404Page()
  }

  private useContainers() {
    routingControllersUseContainer(Container);
    typeormOrmUseContainer(containerTypeorm);
    socketUseContainer(Container);
    cronUseContainer(Container);
  }

  private async typeOrmCreateConnection() {
    try {
      const tempConfig = { ...dbConfig, synchronize: false };
      const tempConnection = await createConnection(tempConfig);
      
      try {
        await tempConnection.query(`
          CREATE OR REPLACE FUNCTION uuid_generate_v4()
          RETURNS uuid AS $$
          BEGIN
            RETURN gen_random_uuid();
          END;
          $$ LANGUAGE plpgsql;
        `);
      } catch (funcError: any) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Could not create UUID function:', funcError?.message);
        }
      }
      
      await tempConnection.close();
      await createConnection(dbConfig);
    } catch (error) {
      console.error('❌ Cannot connect to database:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  private registerEvents() {
    return loadEventDispatcher();
  }

  private registerCronJobs() {
    if (!appConfig.cronJobsEnabled) {
      return false;
    }

    registerCronJobs([__dirname + appConfig.cronJobsDir]);
  }

  private serveStaticFiles() {
    this.app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
  }

  private setupMiddlewares() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    loadHelmet(this.app);
  }

  private registerSocketControllers() {
    const server = require('http').Server(this.app);
    const io = require('socket.io')(server);

    this.app.use(function (req: any, res: any, next) {
      req.io = io;
      next();
    });

    server.listen(this.port, () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🚀 Server started at http://localhost:${this.port}`);
      }
    });

    useSocketServer(io, {
      controllers: [__dirname + appConfig.controllersDir],
    });
  }

  private registerRoutingControllers() {
    useExpressServer(this.app, {
      validation: { stopAtFirstError: true },
      cors: true,
      classTransformer: true,
      defaultErrorHandler: false,
      routePrefix: appConfig.routePrefix,
      controllers: [__dirname + appConfig.controllersDir],
      middlewares: [__dirname + appConfig.middlewaresDir],
    });
  }

  private registerDefaultHomePage() {
    this.app.get('/', (req, res) => {
      res.json({
        title: appConfig.name,
        mode: appConfig.node,
        date: new Date(),
      });
    });
  }

  private register404Page() {
    this.app.get('*', function (req, res) {
      res.status(404).send({ status: 404, message: 'Page Not Found!' });
    });
  }

  private setupSwagger() {
    // Parse class-validator classes into JSON Schema
    const schemas = validationMetadatasToSchemas({
      refPointerPrefix: '#/components/schemas/',
    });

    // Parse routing-controllers classes into OpenAPI spec:
    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(
      storage,
      { routePrefix: appConfig.routePrefix },
      {
        components: {
          schemas,
          securitySchemes: { 
            bearerAuth: { 
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        info: {
          description: 'Welcome to the club!',
          title: 'API Documentation',
          version: '1.0.0',
          contact: {
            name: 'Vaultwrx',
            url: 'https://vaultwrx.com',
            email: 'dev@vaultwrx.com',
          },
        },
      },
    );

    // Use Swagger
    this.app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(spec));
  }

  private async setupGraphQL() {
    if (!appConfig.graphqlEnabled) {
      return false;
    }

    const graphqlHTTP = require('express-graphql').graphqlHTTP;

    const schema = await buildSchema({
      resolvers: [__dirname + appConfig.resolversDir],
      emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
      container: Container,
    });

    this.app.use('/graphql', (request: express.Request, response: express.Response) => {
      graphqlHTTP({
        schema,
        graphiql: true,
      })(request, response);
    });
  }
}

// Create and export app instance
const appInstance = new App();

// Export app for serverless functions (Netlify, etc.)
export const app = appInstance.app;

// For regular server usage, keep the original behavior
if (require.main === module) {
  // This will run when executed directly (not as a module)
}
