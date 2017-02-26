'use strict'

const API_VERSION = "/"

var router = require('koa-router')(
{
    prefix: API_VERSION
})

module.exports = function(db, models, logger)
{
    router.get("*", function*(next)
    {
        let options = this.state.options = {}
        let query = this.request.query

        // jquery anti cache requests
        if (query["_"])
            delete query["_"]

        // OFFSET
        let offset = parseInt(query.offset)
        if (!isNaN(offset) && offset > 0)
            options.offset = offset
        delete query.offset

        // LIMIT
        let limit = parseInt(query.limit)
        if (!isNaN(limit) && limit > 0)
            options.limit = limit
        delete query.limit

        // SORT
        let sort = query.sort
        if (sort !== undefined && sort.length)
        {
            options.order = []

            let columns = sort.split(',')

            for (let i = 0, length = columns.length; i < length; i++)
            {
                let column = columns[i]

                // if descending, set sort=-column in query string
                if (column.indexOf('-') > -1)
                {
                    column = column.replace('-', '')
                    options.order.push([column, "DESC"])
                }
                else
                    options.order.push([column, "ASC"])
            }
        }
        delete query.sort

        // INCLUDE
        let include = query.include
        if (include !== undefined && include.length)
        {
            options.include = []

            let includeModels = include.split(',')

            for (let i = 0, length = includeModels.length; i < length; i++)
            {
                options.include.push(
                {
                    model: models[includeModels[i]]
                })
            }
        }
        delete query.include

        // FILTER
        options.where = {}
        for (let i in query)
        {
            if (query[i].toString().indexOf(",") != "-1")
            {
                let filterArray = queryFilterToArray(query[i])

                query[i] = {
                    "$or": filterArray
                }
            }
            if (query[i].toString().indexOf("*") !== -1)
            {
                query[i] = {
                    "$iLike": query[i].replace(/\*/g, "%")
                }
            }

            options.where[i] = query[i]
        }

        yield next
    })

    function queryFilterToArray(params)
    {
        let arr = []

        params.split(",").forEach(function(value)
        {
            arr.push(value)
        })

        return arr
    }

    return router
}
