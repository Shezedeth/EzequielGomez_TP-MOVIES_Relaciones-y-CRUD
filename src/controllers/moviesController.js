const path = require("path");
const db = require("../database/models");
const moment = require("moment");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const deleteImage = require("../utils/deleteImage");

//Aquí tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

const API_MOVIES = "http://www.omdbapi.com/?apikey=ece0405c";
const API_ACTORS = "https://api.api-ninjas.com/v1/celebrity?name=";

const moviesController = {
  // -------------------------------------------------------------------
  list: (req, res) => {
    const movies = db.Movie.findAll({
      include: ["genre"],
      order: ["title"],
    });
    const genres = db.Genre.findAll({
      order: ["name"],
    });
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    });
    Promise.all([movies, genres, top])
      .then(([movies, genres, top]) => {
        res.render("moviesList.ejs", {
          movies,
          genres,
          moment,
          top,
          result : 0
        });
      })
      .catch((error) => console.log(error));
  },
  // -------------------------------------------------------------------
  detail: (req, res) => {
    const movies = db.Movie.findByPk(req.params.id, {
      include: ["actors", "genre"],
    });

    const genres = db.Genre.findAll({
      order: ["name"],
    });
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    });
    Promise.all([movies, genres, top])
      .then(([movies, genres, top]) => {
        res.render("moviesDetail", {
          ...movies.dataValues,
          genres,
          moment,
          top,
        });
      })
      .catch((error) => console.log(error));
  },
  // -------------------------------------------------------------------
  new: (req, res) => {
    const moviesNewest = db.Movie.findAll({
      order: [["release_date", "DESC"]],
    });
    const movies = db.Movie.findByPk(req.params.id);

    const genres = db.Genre.findAll({
      order: ["name"],
    });
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    });
    Promise.all([moviesNewest, movies, genres, top]).then(
      ([moviesNewest, movies, genres, top]) => {
        res.render("newestMovies", {
          moviesNewest,
          movies,
          genres,
          moment,
          top,
        });
      }
    );
  },
  // -------------------------------------------------------------------
  recommended: (req, res) => {
    const mejores = db.Movie.findAll({
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    });
    const genres = db.Genre.findAll({
      order: ["name"],
    });
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    });
    Promise.all([genres, top, mejores])
      .then(([genres, top, mejores]) => {
        res.render("recommendedMovies.ejs", {
          genres,
          mejores,
          moment,
          top,
        });
      })
      .catch((error) => console.log(error));
  },
  // -------------------------------------------------------------------
  //Aqui dispongo las rutas para trabajar con el CRUD
  add: function (req, res) {
    const actors = db.Actor.findAll({
      order: [
        ["first_name", "ASC"],
        ["last_name", "ASC"],
      ],
    });

    const genres = db.Genre.findAll({
      order: ["name"],
    });
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    });
    Promise.all([actors, genres, top])
      .then(([actors, genres, top]) => {
        res.render("moviesAdd", {
          genres,
          actors,
          top,
        });
      })
      .catch((error) => console.log(error));
  },
  // -------------------------------------------------------------------
  create: function (req, res) {
    const { title, rating, release_date, awards, length, genre_id } = req.body;
    const actors = [req.body.actors].flat();

    db.Movie.create({
      title: title.trim(),
      rating,
      awards,
      release_date,
      length,
      genre_id,
      image: req.file ? req.file.filename : null,
    })
      .then((movie) => {
        console.log(movie);
        if (actors) {
          const actorsDB = actors.map((actor) => {
            return {
              movie_id: movie.id,
              actor_id: actor,
            };
          });
          db.Actor_Movie.bulkCreate(actorsDB, {
            validate: true,
          }).then(() => {
            console.log("Actores agregados");
            return res.redirect("/movies");
          });
        } else {
          return res.redirect("/movies");
        }
      })
      .catch((error) => console.log(error));
  },
  // -------------------------------------------------------------------
  edit: function (req, res) {
    const movies = db.Movie.findByPk(req.params.id, {
      include: ["actors"],
    });

    const actors = db.Actor.findAll({
      order: [
        ["first_name", "ASC"],
        ["last_name", "ASC"],
      ],
    });

    const genres = db.Genre.findAll({
      order: ["name"],
    });
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    });
    Promise.all([movies, genres, top, actors])
      .then(([movies, genres, top, actors]) => {
        res.render("moviesEdit", {
          movies,
          genres,
          top,
          actors,
          moment,
        });
      })
      .catch((error) => console.log(error));
  },
  // -------------------------------------------------------------------
  update: function (req, res) {
    let { title, rating, release_date, genre_id, awards, length, actors } =
      req.body;

    actors = typeof actors === "string" ? [actors] : actors;

    db.Movie.findByPk(req.params.id).then((movie) => {
      const previousImage = movie.image;
      const newImage = req.file ? req.file.filename : previousImage;

      // actualizo la tabla películas con los datos que van en esa tabla
      db.Movie.update(
        {
          title: title.trim(),
          rating,
          awards,
          release_date,
          image: newImage,
          genre_id,
          length,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      )
        .then(() => {
          if (previousImage !== newImage && previousImage !== "") {
            deleteImage(previousImage);
          }

          db.Actor_Movie.destroy({
            where: {
              movie_id: req.params.id,
            },
          }).then(() => {
            if (actors) {
              const actorsDB = actors.map((actor) => {
                return {
                  movie_id: req.params.id,
                  actor_id: actor,
                };
              });
              db.Actor_Movie.bulkCreate(actorsDB, {
                validate: true,
              }).then(() => {
                console.log("actores agregados correctamente");
              });
            }
          });
        })
        .catch((error) => console.log(error))
        .finally(() => res.redirect("/movies"));
    });
  },
  // -------------------------------------------------------------------
  delete: function (req, res) {
    db.Movie.findByPk(req.params.id)
      .then((movie) => {
        return res.render("moviesDelete", {
          Movie: movie,
        });
      })
      .catch((error) => console.log(error));
  },
  // -------------------------------------------------------------------
  destroy: function (req, res) {
    // TODO
    db.Movie.findByPk(req.params.id).then((movie) => {
      deleteImage(movie.image);
    });

    db.Actor_Movie.destroy({
      where: {
        movie_id: req.params.id,
      },
    })
      .then(() => {
        db.Actor.update(
          {
            favorite_movie_id: null,
          },
          {
            where: {
              favorite_movie_id: req.params.id,
            },
          }
        ).then(() => {
          db.Movie.destroy({
            where: {
              id: req.params.id,
            },
          }).then(() => {
            return res.redirect("/movies");
          });
        });
      })
      .catch((error) => console.log(error));
  },
  buscar: (req, res) => {
    const title = req.query.titulo;

    fetch(`${API_MOVIES}&t=${title}`)
      .then((data) => {
        return data.json();
      })
      .then((movie) => {
        // console.log(movie)
        return res.render("moviesDetailOmdb", {
          movie,
        });
      })
      .catch((error) => console.log(error));
  },
  // -----------------------------------------------------------------------------------
  search: (req, res) => {
    const keyword = req.query.keyword;
    
    const genres = db.Genre.findAll({
      order: ["name"],
    });
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    });
    
    const movies = db.Movie.findAll({
      include: ["genre"],
      where : {
        title : {
          [Op.substring] : keyword
        }
      }
    });
    Promise.all([genres,top, movies])
    .then(([genres,top ,movies]) => {
      return res.render("moviesList", {
        genres,
        top,
        movies,
        moment,
        result : 1
        
      });
    }).catch((error) => console.log(error));
   
  },
};

module.exports = moviesController;
