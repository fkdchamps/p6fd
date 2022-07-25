const mongoose = require('mongoose');//import library pour connection à la base de données

const sauceSchema = mongoose.Schema({//schema de modèle d'un objet sauce en base de données
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: {type: String, required: true},
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, required: true },
  dislikes: { type: Number,  required: true },
  usersLiked: { type: [String],  required: true },
  usersDisliked: { type: [String],  required: true }
});

module.exports = mongoose.model('Sauce', sauceSchema);