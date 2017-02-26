'use strict'

const routePrefix = '/movies'

var router = require('koa-router')(
{
    prefix: routePrefix
})
var utils = require("../lib/utils.js")

module.exports = function(db, models, logger)
{
    let model = models["movie"]

    // GET ALL / GET BY ID / GET BY UID
    router.get("/:id?", function*()
    {
        logger.debug(`Started ${this.request.method} ${this.request.url}`)

        try
        {
            let id = this.params.id
            let options = this.state.options
            let data = null

            // get one by id/uid
            if (id)
            {
                isNaN(id) ? options.where.uid = id : options.where.id = id
                data = yield model.findOne(options)
            }
            // or get all
            else
            {
                // if HEAD request send only item count
                if (this.method == "HEAD")
                {
                    this.response.set("x-total-count", yield model.count(
                    {
                        where: options.where,
                        include: options.include
                    }))
                }
                // if this is normal GET request return all data with item count
                else
                {
                    data = yield model.findAndCountAll(options)

                    this.response.set("x-total-count", data.count)
                    data = data.rows
                }
            }

            utils.sendResponse(this, data)

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
