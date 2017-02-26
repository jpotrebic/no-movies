'use strict'
var frisby = require('frisby')
var config = require("../config")

const serverHost = config.httpServer.host
const serverPort = config.httpServer.port

var path = `http://${serverHost}:${serverPort}/movies`

frisby.create('[MOVIES] get all movies')
    .get(path)
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes(
    {
        status: String,
        data: function(data)
        {
            if (!data)
                return true
            for (let i = 0; i < data.length; ++i)
            {
                expect(data[i]).toContainJsonTypes(
                {
                    id: Number,
                    uid: String,
                    title: String,
                    year: Number,
                    duration: Number,
                    poster: function(val)
                    {
                        expect(val).toBeTypeOrNull(String)
                    },
                    genres: function(val)
                    {
                        expect(val).toBeTypeOrNull(String)
                    },
                    plot: function(val)
                    {
                        expect(val).toBeTypeOrNull(String)
                    },
                    director: function(val)
                    {
                        expect(val).toBeTypeOrNull(String)
                    },
                    writer: function(val)
                    {
                        expect(val).toBeTypeOrNull(String)
                    },
                    actors: function(val)
                    {
                        expect(val).toBeTypeOrNull(String)
                    },
                    country: function(val)
                    {
                        expect(val).toBeTypeOrNull(String)
                    },
                    language: function(val)
                    {
                        expect(val).toBeTypeOrNull(String)
                    },
                    metadata: function(val)
                    {
                        expect(val).toBeTypeOrNull(Object)
                    },
                    age_rating: function(val)
                    {
                        expect(val).toBeTypeOrNull(String)
                    },
                    imdb_rating: function(val)
                    {
                        expect(val).toBeTypeOrNull(Number)
                    },
                    imdb_url: function(val)
                    {
                        expect(val).toBeTypeOrNull(String)
                    }
                })
            }
        }
    })
    .afterJSON(function(movies)
    {
        frisby.create('[V1/MOVIES] get movie by id')
            .get(path + '/' + movies.data[0].id)
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSONTypes('data',
            {
                id: Number,
                uid: String,
                title: String,
                year: Number,
                duration: Number,
                poster: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                genres: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                plot: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                director: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                writer: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                actors: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                country: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                language: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                metadata: function(val)
                {
                    expect(val).toBeTypeOrNull(Object)
                },
                age_rating: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                imdb_rating: function(val)
                {
                    expect(val).toBeTypeOrNull(Number)
                },
                imdb_url: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                }
            })
            .toss()

        frisby.create('[V1/MOVIES] get movie by uid')
            .get(path + '/' + movies.data[0].uid)
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSONTypes('data',
            {
                id: Number,
                uid: String,
                title: String,
                year: Number,
                duration: Number,
                poster: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                genres: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                plot: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                director: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                writer: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                actors: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                country: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                language: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                metadata: function(val)
                {
                    expect(val).toBeTypeOrNull(Object)
                },
                age_rating: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                },
                imdb_rating: function(val)
                {
                    expect(val).toBeTypeOrNull(Number)
                },
                imdb_url: function(val)
                {
                    expect(val).toBeTypeOrNull(String)
                }
            })
            .toss()
    })
    .toss()
