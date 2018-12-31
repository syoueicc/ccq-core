import * as body from 'koa-better-body'
import globalMd from '../middlewares/globalMiddleware'
import { resolve } from 'path'

const basePath = resolve(__dirname, '../')
export default {

  middlewares: [
    [body],
    [globalMd, { globalText: 'globalText' }],
  ],

  database: {
    type: 'sqlite',
    name: 'default',
    database: `${basePath}/database.db`,
    synchronize: true,
    "entities": [
      `${basePath}/entity/**/*.{ts,js}`
    ],
    cli: {
      entitiesDir: `${basePath}/entity`,
      migrationsDir: `${basePath}/migration`
    }
  }
}