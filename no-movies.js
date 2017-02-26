"use strict"

// Dependencies
var bodyParser = require("koa-bodyparser")
var cluster = require("cluster")
var co = require("co")
var config = require("./config")
// var docsGenerator = require('./lib/docsGenerator.js')
var fs = require("co-fs")
var http = require("http")
var koa = require("koa")()
var downloadMovies = require('./data/downloadMovies.js')
var path = require("path")
var populateDatabase = require('./data/populateDatabase.js')
var utils = require("./lib/utils.js")
var log4js = require("log4js")

// Flags
var argv = require('yargs')
    .usage('Usage: npm start -- [options]')
    .option('debug',
    {
        describe: 'Start in debug mode',
        type: 'boolean'
    })
    .option('http-host',
    {
        describe: 'Http host',
        type: 'string'
    })
    .option('http-port',
    {
        describe: 'Http port',
        type: 'number'
    })
    .option('workers-count',
    {
        describe: 'Number of workers',
        type: 'number',
    })
        .option('db-user',
    {
        describe: 'Database user name',
        type: 'string'
    })
    .option('db-pass',
    {
        describe: 'Database password',
        type: 'string'
    })
    .option('db-host',
    {
        describe: 'Database host',
        type: 'string'
    })
    .option('db-port',
    {
        describe: 'Database connection port',
        type: 'number'
    })
    .option('db-name',
    {
        describe: 'Database name',
        type: 'string'
    })
    .option('db-populate',
    {
        describe: 'Database populate',
        type: 'string',
        default: 'false',
        choices: ['true', 'false', 'empty']
    })
    .option('download-movies',
    {
        describe: 'Create/update movie files in ./data/movies',
        type: 'boolean',
    })
    .help('h')
    .alias('h', 'help')
    .argv;

// Command-line switches parsing and configuration overriding
new Map(config.switchMapping).forEach(function(confSwitch, cliSwitch)
{
    if (argv[cliSwitch])
        config[confSwitch] = argv[cliSwitch]
})

co(function*()
{
    try
    {
        // Initialize logger
        var logger = yield initLogger(config.log, argv.debug)

        logger.debug("logging started")

        // Initialize database
        let db = defineDatabase(config.db, logger)
        let models = yield loadDatabaseModels(config.db.models.dir, db)

        logger.debug("database initialized")

        // set cluster size
        let clusterSize = 2
        if (argv['workers-count'])
        {
            clusterSize = argv['workers-count']
        }
        else
        {
            let cpus = require("os").cpus().length
            clusterSize = cpus < 4 ? cpus : 4
        }

        // Master
        if (cluster.isMaster)
        {
            // Download movie information
            if (argv["download-movies"])
                yield downloadMovies(logger)

            // Populate database
            yield initDatabase(models, db, argv['db-populate'], logger)

            // Run workers
            let workers = []
            try
            {
                for (var i = 0; i < clusterSize; i++)
                {
                    let worker = cluster.fork()

                    workers.push(worker)
                    logger.debug("spawned worker", worker.id)

                    // receive messages from workers
                    worker.on("message", function(message)
                    {
                        // Send data from workers to cluster and vice versa
                        co(function*()
                        {
                            yield messageHandler(message, worker.id)
                        })
                    })
                }
            }
            catch (error)
            {
                logger.error("cluster fork error:", error)
            }

            cluster.on("exit", function(oldWorker, code, signal)
            {
                delete workers[oldWorker.id]

                // spawn new worker
                let newWorker = cluster.fork()
                workers[newWorker.id] = newWorker

                newWorker.on("message", function(message)
                {
                    // Send data from workers to cluster and vice versa
                    co(function*()
                    {
                        yield messageHandler(message, newWorker.id)
                    })
                })

                logger.info("[master pid %s] -- worker %s exited with code %s; signal %s", process.pid, oldWorker.id, code, signal)
            })

            process.on('SIGINT', function()
            {
                exitHandler('SIGINT')
            })
            process.on('SIGTERM', function()
            {
                exitHandler('SIGTERM')
            })
            process.on('SIGHUP', function()
            {
                exitHandler('SIGHUP')
            })

            process.on("exit", function()
            {
                logger.info("[master pid %s] -- server shut down correctly.\n", process.pid)
            })

            process.on("uncaughtException", function(err)
            {
                logger.fatal("caught exception: %s", err)
            })

            function exitHandler(signal)
            {
                logger.info("[master pid %s] -- got %s signal", process.pid, signal)
                process.exit(0)
            }

            // we receive message from one worker and send it to rest of the workers or master appropriately
            function* messageHandler(message, worker_id)
            {
                if (message.uid === "logger")
                    sendMessage(message, worker_id)
            }

            // send message to all workers
            function sendMessage(msg, wid)
            {
                for (const worker of workers)
                {
                    if (worker.id === wid)
                        continue

                    worker.send(msg)
                }
            }
        }
        // Worker processes
        else
        {
            try
            {
                process.on('message', function(message)
                {
                    switch (message.uid)
                    {
                        case "logger":
                            logger.setLevel(message.data)
                            break

                        default:
                            logger.warn("uncaught message sent:", message)
                    }
                })

                // Access handler
                koa.use(function*(next)
                {
                    logger.info('api [worker pid %s] - start: %s: %s %s', process.pid, this.request.ip, this.method, this.url)
                    var start = new Date
                    yield next;
                    var ms = new Date - start;
                    logger.info('api [worker pid %d] - done: %d %s: %s %s - %sms', process.pid, this.status, this.request.ip, this.method, this.url, ms)
                })

                // Error handler
                koa.use(function*(next)
                {
                    try
                    {
                        yield next
                    }
                    catch (error)
                    {
                        utils.sendError(this, error.errors && error.errors[0].message || error.message,
                            error.status, error.errors && error.errors[0] || error.name)
                    }
                })

                // 404 handling
                koa.use(function*(next)
                {
                    yield next

                    if (this.status == 404)
                    {
                        this.throw(404)
                    }
                })

                // Routes
                let routeDir = yield fs.readdir(`${config.routes.dir}`)
                if (!routeDir.length)
                    throw "no routes found at " + config.routes.dir

                let routes = {}
                for (let route of routeDir)
                {
                    if (config.routes.blacklist.indexOf(route) > -1 || path.extname(route) != ".js")
                        continue

                    route = path.basename(route, ".js")

                    logger.debug("loading route", route)

                    routes[route] = require(`${config.routes.dir}/${route}`)
                }

                // API handlers
                koa.use(bodyParser())
                koa.use(require(`${config.routes.dir}/common.js`)(db, models, logger).routes())
                for (let route of Object.keys(routes))
                {
                    koa.use(routes[route](db, models, logger).routes())
                }

                // Webserver startup
                http.createServer(koa.callback()).listen(config.httpServer.port, config.httpServer.host)
                logger.info(`[worker pid ${process.pid}] -- listening on port ${config.httpServer.port}`)
            }
            catch (error)
            {
                logger.error("error:", error)
            }
        }
    }
    catch (error)
    {
        logger.error("error:", error)
    }
})

function* initLogger(config, debug)
{
    try
    {
        // configure and initialize logger
        log4js.configure(config)
        var logger = log4js.getLogger('no-movies');

        // set logger level
        if (debug === true)
            logger.setLevel('DEBUG')
        else
            logger.setLevel('INFO')

        return logger
    }
    catch (error)
    {
        console.log("initLogger failed:", error)
        return
    }
}

function defineDatabase(config, logger)
{
    let db = new(require('sequelize'))(config.name,
        config.user,
        config.pass,
        {
            host: config.host,
            port: config.port,
            dialect: "postgres",
            logging: false,
            pool:
            {
                maxConnections: config.maxConnections,
                minConnections: config.minConnections,
                maxIdleTime: config.connectionIdleTime
            }
        })

    return db
}

function* loadDatabaseModels(modelsDir, db)
{

    let files = yield fs.readdir(modelsDir)
    if (!files.length)
    {
        throw 'no database models found at:' + modelsDir
    }

    let models = {}
    for (let file of files)
    {
        if (file.indexOf(".") === 0 || file.indexOf(".swp") !== -1)
            continue

        let model = db["import"](`${__dirname}/${modelsDir}/${file}`)
        models[model.name] = model
    }

    for (let modelName in models)
        if ("associate" in models[modelName])
            models[modelName].associate(models)

    return models
}

function* initDatabase(models, db, populate, logger)
{
    // init and populate db
    switch (populate)
    {
        case "false":
            break
        case "true":
            yield db.sync(
            {
                force: true
            })
            yield populateDatabase(db, models, logger)
            break
        case "empty":
            yield db.dropSchema("public")
            yield db.createSchema("public")
            yield db.sync(
            {
                force: false
            })
            break
        default:
            logger.error("unsupported populate value %s for database %s, exiting",
                populate, db.config.database)
            process.exit(1)
    }
}
