const db = require("../database/models");
const sequelize = db.sequelize;

const genresController = {
  list: (req, res) => {
  
    const movies = db.Movie.findAll({
        include: ['genre'],
        order: ['title'],
    })
    const genres = db.Genre.findAll({
      order: ['id'],
      include : ['movies']
    })
    const top = db.Movie.findAll({
      limit: 5,
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    })
    const genre = db.Genre.findAll({
        include : ['movies']
    })
  
    Promise.all([movies,genres,top,genre])
  
    .then(([movies,genres,top]) => {
        return res.render("genresList", {
        movies,
        genres,
        genre,
        top 
        });
      })
      .catch((error) => console.log(error));
    
  },
  detail: (req, res) => {
    db.Genre.findByPk(req.params.id).then((genre) => {
      res.render("genresDetail", { genre });
    });
  },
};

module.exports = genresController;
