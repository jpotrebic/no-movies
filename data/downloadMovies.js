'use strict'

var fs = require('co-fs')
var imdb = require('imdb-api')

// movie static data paths
const movieDir = "./data/movies/"
const TAG = "downloadMovies -"

module.exports = function* downloadMovies(logger)
{
    let len = movies.length
    logger.info(TAG, "fetching movies")

    for (let i = 0; i < len; i++)
    {
        imdb.getReq({ name: movies[i] }, (err, movie) =>
        {
            try
            {
                if (err)
                    throw(err)

                // filename = imdb_id + name
                // eg: tt0111161_the_shawshank_redemption
                let filename = movie.imdbid + "_" + movie.title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "_");

                // write movie info in file
                fs.writeFile(movieDir + filename + '.json', JSON.stringify(movie, null, 2))
            }
            catch (err)
            {
                logger.error(TAG, err)
            }
        })
    }
}

var movies = [
    'Moana',
    'Hacksaw Ridge',
    'Doctor Strange',
    'Jackie',
    'The Accountant',
    'Deepwater Horizon',
    'A Monster Calls',
    'The Magnificent Seven',
    'Moonlight',
    'Arrival',
    'Kubo and the Two Strings',
    'War Dogs',
    'Star Trek Beyond',
    'The Infiltrator',
    'Warcraft',
    'Finding Dory',
    'The Conjuring 2',
    'X-Men: Apocalypse',
    'Me Before You',
    'All The Way',
    'The Nice Guys',
    'Captain America: Civil War',
    'The Jungle Book',
    'Zootopia',
    'Deadpool',
    'Captain Fantastic',
    'Hunt for the Wilderpeople',
    'Swiss Army Man',
    'Kung Fu Panda 3',
    'Demolition',
    'The Little Prince',
    'The Revenant',
    'Star Wars: The Force Awakens',
    'The Hateful Eight',
    'The Martian',
    'The Man from U.N.C.L.E.',
    'Straight Outta Compton',
    'Southpaw',
    'Ant-Man',
    'Jurassic World',
    'Inside Out',
    'Mad Max: Fury Road',
    'Avengers: Age of Ultron',
    'Ex Machina',
    'Kingsman: The Secret Service',
    'The Hobbit: The Battle of the Five Armies',
    'Interstellar',
    'Big Hero 6',
    'Gone Girl',
    'Pride',
    'Nightcrawler',
    'John Wick',
    'The Imitation Game',
    'Guardians of the Galaxy',
    'Dawn of the Planet of the Apes',
    '22 Jump Street',
    'Edge of Tomorrow',
    'Maleficent',
    'X-Men: Days of Future Past',
    'Predestination',
    'The LEGO Movie',
    'What We Do in the Shadows',
    'Snowpiercer',
    'The Wolf of Wall Street',
    'The Hobbit: The Desolation of Smaug',
    'Her',
    'Dallas Buyers Club',
    'Rush',
    'Prisioners',
    'Pacific Rim',
    'World War Z',
    'Man of Steel',
    'Monsters University',
    'Now You See Me',
    'Star Trek Into Darkness',
    'Les Miserables',
    'Django Unchained',
    'The Hobbit: An Unexpected Journey',
    'Wreck-It Ralph',
    'The Avengers'
]
