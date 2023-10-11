const path = require("path");
const db = require("../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");

//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

const indexController = {
  home: (req, res) => {
    const movies = db.Movie.findAll({
    //   include: ["genre"],
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
    Promise.all([movies, genres, top]).then(([movies, genres, top]) => {
      res.render("index", { movies, genres, top });
    });
  },
};
module.exports =indexController;
