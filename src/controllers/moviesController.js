const path = require("path");
const db = require("../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");

//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

const moviesController = {
  list: (req, res) => {
    const movies = db.Movie.findAll({
        include: ['genre'],
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
      top 
      });
    });
  },
  detail: (req, res) => {
    db.Movie.findByPk(req.params.id).then((movie) => {
      res.render("moviesDetail.ejs", { movie });
    });
  },
  new: (req, res) => {
    db.Movie.findAll({
      order: [["release_date", "DESC"]],
      limit: 5,
    }).then((movies) => {
      res.render("newestMovies", { movies });
    });
  },
  recomended: (req, res) => {
    db.Movie.findAll({
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    }).then((movies) => {
      res.render("recommendedMovies.ejs", { movies });
    });
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
    });
   
  },
  create: function (req, res) {
    if (errors.isEmpty()) {
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
      });
    } else {
      return res.render("moviesAdd");
    }
  },
  edit: function (req, res) {
    db.Movie.findByPk(req.params.id)
      .then((movie) => {
        console.log(moment(movie.release_date).format("YYYY-MM-DD"));
        return res.render("moviesEdit", {
          movie,
          Movie: movie,
          moment,
        });
      })
      .catch((error) => console.log(error));
  },
  update: function (req, res) {},
  delete: function (req, res) {
    db.Movie.findByPk(req.params.id)
      .then((movie) => {
        return res.render("moviesDelete", {
          Movie: movie,
        });
      })
      .catch((error) => console.log(error));
  },
  destroy: function (req, res) {},
};

module.exports = moviesController;
