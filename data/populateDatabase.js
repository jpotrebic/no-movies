'use strict'

var fs = require('co-fs')

const movieDir = "./data/movies/"
const TAG = "populate-db -"

module.exports = function* populateDatabase(db, models, logger)
{
    try
    {
        // MOVIES
        logger.info(TAG, "inserting movies")

        let movieFiles = yield fs.readdir(movieDir)
        let movies = []

        for (let movieFile of movieFiles)
        {
            let data = JSON.parse(yield fs.readFile(`${movieDir}/${movieFile}`, 'utf8'))

            let duration = []
            if (data.runtime === 'N/A')
            {
                logger.warn(TAG, `Duration is not available, skipping movie ${data.title}`)
                continue
            }
            else
                duration = data.runtime.split(" ")

            movies.push({
                uid: data.imdbid,
                title: data.title,
                year: data.year,
                duration: duration[0],
                poster: data.poster,
                genres: data.genres,
                plot: data.plot,
                director: data.director,
                writer: data.writer,
                actors: data.actors,
                country: data.country,
                language: data.languages,
                metadata: {
                    awards: data.awards,
                    released: data.released
                },
                age_rating: data.rated,
                imdb_rating: data.rating,
                imdb_url: data.imdburl
            })
        }

        yield models["movie"].bulkCreate(movies, {logging: false})
    }
    catch (err)
    {
        logger.error(TAG, err)
    }
}
