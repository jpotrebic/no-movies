'use strict'

const routePrefix = "/logger"
const levels = [
    'FATAL',
    'ERROR',
    'WARN',
    'INFO',
    'DEBUG',
    'TRACE'
]

var router = require('koa-router')(
{
    prefix: routePrefix
})
var utils = require("../lib/utils.js")


module.exports = function(db, sql, logger, models)
{
    router.get("/", function*()
    {
        logger.debug(`Started ${this.request.method} ${this.request.url} ...`)

        try
        {
            let level = logger.level.levelStr

            utils.sendResponse(this,
            {
                "logging_level": level
            })

            logger.debug(`Finished ${this.request.method} ${this.request.url} SUCCESS ...`)
        }
        catch (error)
        {
            logger.debug(`Finished ${this.request.method} ${this.request.url} WITH AN ERROR ...`)
            logger.error(`${routePrefix}:`, error)

            utils.sendError(this, error.errors && error.errors[0].message || error.message, error.status || 400, error.errors)
        }
    })

    // change logging level (debug, verbose, info, warn, error)
    router.put("/:level", function*()
    {
        logger.debug(`Started ${this.request.method} ${this.request.url} ...`)

        try
        {
            let level = this.params.level.toUpperCase()

            if (levels.indexOf(level) === -1)
            {
                return utils.sendError(this, "logging level is not valid")
            }

            logger.setLevel(level)

            process.send(
            {
                uid: 'logger',
                data: level
            })

            utils.sendResponse(this,
            {
                "message": `logging level for set to ${level}`
            })

            logger.debug(`Finished ${this.request.method} ${this.request.url} SUCCESS ...`)
        }
        catch (error)
        {
            logger.debug(`Finished ${this.request.method} ${this.request.url} WITH AN ERROR ...`)
            logger.error(`${routePrefix}:`, error)

            utils.sendError(this, error.errors && error.errors[0].message || error.message, error.status || 400, error.errors)
        }
    })

    return router
}
