var config = {}
module.exports = config

// Server
var httpServer = config.httpServer = {}
httpServer.host = "127.0.0.1"
httpServer.port = 38080

// Routes
var routes = config.routes = {}
routes.dir = "./routes"
// blacklist routes which are not permitted to be autoloaded
routes.blacklist = ['common.js']

// Database
var db = config.db = {}
db["user"] = "postgres"
db["pass"] = "postgres"
db["host"] = "127.0.0.1"
db["port"] = 5432
db["type"] = "postgres"
db["name"] = "no_movies"

db["maxConnections"] = 25
db["minConnections"] = 1
db["connectionIdleTime"] = 10000 // ms

db["models"] = {}
db["models"]["dir"] = "./models"

// Docs
var doc = config.doc = {}
// where docs are created and served from
doc.rootDir = "./doc"
doc.rootPath = "/doc"

// Log
var log = config.log = {}
log["appenders"] =
    [{
        type: "console",
        layout:
        {
            type: "colour"
        }
    }]
log.replaceConsole = true

// overide default logging level
config.debug = false
