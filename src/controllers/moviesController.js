const path = require("path");
const db = require("../database/models");
const moment = require("moment");
const sequelize = db.sequelize;
const { Op } = require("sequelize");

//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

const moviesController = {
  list: (req, res) => {
    const movies = db.Movie.findAll({
        include: ['genre'],
        order: ['title'],
    })
    const genres = db.Genre.findAll({
      order: ['name'],
    })
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    })
    Promise.all([movies,genres,top])
    .then(([movies,genres,top]) => {
      res.render("moviesList.ejs", {
      movies,
      genres,
      moment,
      top 
      });
    })
    .catch((error) => console.log(error));
  },
  detail: (req, res) => {
    const movies = db.Movie.findByPk(req.params.id)
    
    const genres = db.Genre.findAll({
    order: ['name'],
  })
    const top = db.Movie.findAll({
    limit: 5,
    where: {
      rating: { [db.Sequelize.Op.gte]: 8 },
    },
    order: [["rating", "DESC"]],
  })
  Promise.all([movies,genres,top])
  .then(([movies,genres,top]) => {
    res.render("moviesDetail", {
    movies,
    genres,
    moment,
    top 
    });
  })
  .catch((error) => console.log(error));
  },
  new: (req, res) => {
    
    const moviesNewest = db.Movie.findAll({
      order: [["release_date", "DESC"]],
    })
    const movies = db.Movie.findByPk(req.params.id)
    
    const genres = db.Genre.findAll({
    order: ['name'],
  })
    const top = db.Movie.findAll({
    limit: 5,
    where: {
      rating: { [db.Sequelize.Op.gte]: 8 },
    },
    order: [["rating", "DESC"]],
  })
  Promise.all([moviesNewest, movies, genres, top])
  .then(([moviesNewest,movies,genres,top]) => {
    res.render("newestMovies", {
    moviesNewest,
    movies,
    genres,
    moment,
    top 
    });
  })
  },
  recomended: (req, res) => {
    const mejores = db.Movie.findAll({
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    })
    const genres = db.Genre.findAll({
      order: ['name'],
    })
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    })
    Promise.all([genres,top,mejores])
    .then(([genres,top,mejores]) => {
      res.render("recommendedMovies.ejs", {
          genres,
          mejores,
          moment,
          top 
      });
    })
    .catch((error) => console.log(error));
  },
  //Aqui dispongo las rutas para trabajar con el CRUD
  add: function (req, res) {
    const genres = db.Genre.findAll({
      order: ['name'],
    })
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    })
    Promise.all([genres,top])
    .then(([genres,top]) => {
      res.render("moviesAdd", {
          genres,
          top 
      });
    })
    .catch((error) => console.log(error));
   
  },
  create: function (req, res) {
    
      const { title, rating, release_date, awards, length } = req.body;
      db.Movie.create({
        title: title.trim(),
        rating,
        awards,
        release_date,
        length,
      }).then((movie) => {
        console.log(movie);
        return res.redirect("/movies");
      })
      .catch((error) => console.log(error));

  },
  edit: function (req, res) {
  
    const movies = db.Movie.findByPk(req.params.id,{
        include : ['actors']
    
    });
       
    const actors = db.Actor.findAll({
    
      order : [
        ['first_name','ASC'],
        ['last_name','ASC']
      ]
    })
    
    const genres = db.Genre.findAll({
    order: ['name'],
  })
    const top = db.Movie.findAll({
    limit: 5,
    where: {
      rating: { [db.Sequelize.Op.gte]: 8 },
    },
    order: [["rating", "DESC"]],
  })
  Promise.all([movies,genres,top,actors])
  .then(([movies,genres,top,actors]) => {
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
  update: function (req, res) {

    const { title, rating, release_date, awards, length } = req.body;

    db.Movie.update(
      {
        title: title.trim(),
        rating,
        awards,
        release_date,
        length,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    )

      .then((response) => {
        console.log(response);
        return res.redirect("/movies/detail/" + req.params.id);
      })
      .catch((error) => console.log(error));

    
  },
  
  delete: function (req, res) {
    db.Movie.findByPk(req.params.id)
      .then((movie) => {
        return res.render("moviesDelete", {
          Movie: movie,
        });
      })
      .catch((error) => console.log(error));
  },
  destroy: function (req, res) {
    // TODO
    const { id } = req.params;

    db.ActorMovie.destroy({
      where: {
        movie_id: id,
      },
    })
      .then((response) => {
        console.log(response);

        db.Actor.update(
          {
            favorite_movie_id: null,
          },
          {
            where: {
              favorite_movie_id: id,
            },
          }
        ).then((response) => {
          console.log(response);
          db.Movie.destroy({
            where: { id },
          }).then((response) => {
            console.log(response);
            return res.redirect("/movies");
          });
        });
      })
      .catch((error) => console.log(error));
  },
};

module.exports = moviesController;
