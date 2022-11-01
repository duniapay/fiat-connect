import express from 'express'
import Session from 'express-session'
var expressWinston = require('express-winston')
var winston = require('winston')

import { quoteRouter } from './routes/quote'
import { kycRouter } from './routes/kyc'
import { accountsRouter } from './routes/accounts'
import { transferRouter } from './routes/transfer'
import { errorToStatusCode } from './middleware/error'
import { authRouter } from './routes/auth'
import { AppDataSource } from './utils/data-source'

function getSessionName(): string {
  // must return a name for the session cookie, typically the provider name
  return 'DUNIA PAYMENT'
}

export function initApp({
  clientAuthMiddleware,
  sessionSecret,
  chainId,
  client,
}: {
  clientAuthMiddleware: express.RequestHandler[]
  sessionSecret: string
  chainId: number
  client: any
}): express.Application {
  const app = express()
  const dataSource = AppDataSource
  app.use(express.json())

  app.get('/clock', (_req, _res) => {
    // NOTE: you *could* just use res.status(200).send({time: new Date().toISOFormat()}), BUT only if your server is single-node
    //  (otherwise you need session affinity or some way of guaranteeing consistency of the current time between nodes)
    return _res.status(200).send({ time: new Date().toISOString() })
  })

  app.use(
    // https://www.npmjs.com/package/express-session-expire-timeout#sessionoptions
    Session({
      name: getSessionName(),
      secret: sessionSecret,
      resave: true,
      saveUninitialized: true,
      cookie: { secure: true, sameSite: true },
    }),
  )

  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json(),
      ),
      meta: true, // optional: control whether you want to log the meta data about the request (default to true)
      msg: 'HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    }),
  )

  app.use('/auth', authRouter({ chainId, client }))

  app.use('/quote', quoteRouter({ clientAuthMiddleware, client, dataSource }))
  app.use('/kyc', kycRouter({ clientAuthMiddleware, dataSource }))
  app.use('/accounts', accountsRouter({ clientAuthMiddleware, dataSource }))
  app.use(
    '/transfer',
    transferRouter({ clientAuthMiddleware, dataSource, client }),
  )

  app.use(errorToStatusCode)

  // express-winston errorLogger makes sense AFTER the router.
  app.use(
    expressWinston.errorLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json(),
      ),
    }),
  )

  return app
}
