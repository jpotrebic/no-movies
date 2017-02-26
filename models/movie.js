module.exports = function(sequelize, dataTypes)
{
    var movie = sequelize.define('movie',
    {
        id:
        {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        uid:
        {
            type: dataTypes.TEXT,
            allowNull: false,
            validate:
            {
                len: [1, 100]
            }
        },
        title:
        {
            type: dataTypes.TEXT,
            allowNull: false
        },
        year:
        {
            type: dataTypes.INTEGER,
            allowNull: false
        },
        duration:
        {
            type: dataTypes.INTEGER,
            allowNull: false
        },
        poster:
        {
            type: dataTypes.TEXT
        },
        genres:
        {
            type: dataTypes.TEXT
        },
        plot:
        {
            type: dataTypes.TEXT
        },
        director:
        {
            type: dataTypes.TEXT
        },
        writer:
        {
            type: dataTypes.TEXT
        },
        actors:
        {
            type: dataTypes.TEXT
        },
        country:
        {
            type: dataTypes.TEXT
        },
        language:
        {
            type: dataTypes.TEXT
        },
        metadata:
        {
            type: dataTypes.JSONB
        },
        age_rating:
        {
            type: dataTypes.TEXT
        },
        imdb_rating:
        {
            type: dataTypes.FLOAT,
            validate:
            {
                max:
                {
                    args: 10,
                    msg: "rating must be between 1-10"
                },
                min:
                {
                    args: 1,
                    msg: "rating must be between 1-10"
                }
            }
        },
        imdb_url:
        {
            type: dataTypes.TEXT
        }
    },
    {
        freezeTableName: true,
        underscored: true,
        tableName: 'movies',
        indexes: [
            {
                fields: ['uid'],
                unique: true
            }
        ]
    })

    return movie
}
