# no-movies
Not only movies. We have ćevapi!

## Installation

For building and using no-movies server, node.js is required

    # install latest node.js package manager
    npm install -g npm

    # install n package manager
    npm install -g n

    # install latest node
    n latest

Install no-movies dependencies

    npm install

## Running

    npm start

    # show all flags
    npm start -- --help

    # start the server and initialize an empty database
    npm start -- --db-populate=empty

    # download demo movies
    npm start -- --download-movies

    # populate database with demo movies
    npm start -- --db-populate=true

    # start server with debug logs
    npm start -- --debug

## Tests

    # run from no-movies directory
    ./tests/run_tests.sh

## Api examples

    Examples are written using default server configuration (config/index.js)

    # fetch all movies
    curl 'http://127.0.0.1:38080/movies'

    # fetch one movie by id or uid
    curl 'http://127.0.0.1:38080/movies/1'
    curl 'http://127.0.0.1:38080/movies/tt4975722'

    # check logger level
    curl 'http://127.0.0.1:38080/logger'

    # set logger level
    curl -X PUT 'http://127.0.0.1:38080/logger/WARN'
