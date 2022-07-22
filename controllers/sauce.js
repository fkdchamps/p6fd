const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked: [0],
      usersDisliked: [0]
  });

  sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    })
    .catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const numLikeSent = req.body.like;
      const likeUser = req.body.userId;
      if (likeUser == sauce.userId){
        res.status(403).json({ message : 'vous ne pouvez pas liker ou unliker'});
        return;
      };
      
      //--------------------------------------------
      if (numLikeSent == -1){//dislike
        if ((sauce.usersDisliked.length == 1) || (sauce.usersDisliked.includes(likeUser) == false)) {//user n'a jamais disliké cette sauce
          sauce.dislikes +=1;
          sauce.usersDisliked.push(likeUser);
          if (sauce.usersLiked.includes(likeUser)) {
            sauce.usersLiked = sauce.usersLiked.filter(function(f) { return f !== likeUser });
            sauce.likes += -1
          }
        }else{
          res.status(403).json({ message : 'vous avez déjà unliké' });
        }
      };

      //---------------------------------------------------
      if (numLikeSent == 0){//undislike ou unlike
        if ((sauce.usersDisliked.length !== 1) && (sauce.usersDisliked.includes(likeUser) == true)) {//user a disliké cette sauce
          sauce.dislikes += -1;
          sauce.usersDisliked = sauce.usersDisliked.filter(function(f) { return f !== likeUser });
        }else if ((sauce.usersLiked.length !== 1) && (sauce.usersLiked.includes(likeUser) == true)) {//user a liké cette sauce
          sauce.likes += -1;
          sauce.usersLiked = sauce.usersLiked.filter(function(f) { return f !== likeUser });
        };
      };

      //------------------------------------------------------
      if (numLikeSent == 1){//like
        if ((sauce.usersLiked.length == 1) || (sauce.usersLiked.includes(likeUser) == false)) {//user n'a jamais liké cette sauce
          sauce.likes +=1;
          sauce.usersLiked.push(likeUser);
          if (sauce.usersDisliked.includes(likeUser)) {
            sauce.usersDisliked = sauce.usersDisliked.filter(function(f) { return f !== likeUser });
            sauce.dislikes += -1
          }
        }else{
          res.status(403).json({ message : 'vous avez déjà liké'});
        }
      };
      Sauce.updateOne({ _id: req.params.id }, {$set: {likes: sauce.likes, dislikes: sauce.dislikes, usersLiked: sauce.usersLiked, usersDisliked: sauce.usersDisliked}})//mise à jour dans tous les cas
      .then(() => res.status(200).json({message : 'likes/dislikes de la sauce bien mis à jour'}))
      })
    .catch( error => {
      res.status(500).json({ error })
    })
};
