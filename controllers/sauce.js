const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  /* delete sauceObject._id; */
  /* delete sauceObject._userId; */
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

  /* delete sauceObject._userId; */
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              console.log("sauceobjet à la mise à jour", sauceObject);
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
  Sauce.findOne({ _id: req.params.id})
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
        console.log("sauce trouvée à taguer en like : ", sauce)
        const numLikeSent = req.body.like;
        console.log('like =', numLikeSent);
        const likeUser = req.body.userId;
        console.log("likeUser", likeUser);
        console.log("usersDisliked", sauce.usersDisliked);
        if (numLikeSent == -1){//dislike
          if ((sauce.usersDisliked.length == 1) || (sauce.usersDisliked.includes(likeUser) == false)) {//user n'a jamais disliké cette sauce
            sauce.dislikes +=1;console.log("dislike", sauce.dislikes);
            sauce.usersDisliked.push(likeUser);
            console.log("new tableau", sauce.usersDisliked)
            if (sauce.usersLiked.includes(likeUser)) {
              sauce.usersLiked = sauce.usersLiked.filter(function(f) { return f !== likeUser });
              sauce.likes += -1
            }
          }else{
            res.status(403).json({ message : 'vous avez déjà unliké'});
          }
          console.log("sauce à la mise à jour", sauce);
          Sauce.updateOne({ _id: req.params.id }, {$set: {likes: sauce.likes, dislikes: sauce.dislikes, usersLiked: sauce.usersLiked, usersDisliked: sauce.usersDisliked}})//mise à jour dans tous les cas
          .then(
            console.log("mise à jour")
          )
        };
      })
      .catch( error => {
        res.status(500).json({ error });
      })
        /* else if numLikeSent = 0 {
          if l'user est dans usersLiked{
            effacer user et oter 1 like
          }
          else ifl'user est dans usersliked{
            effacer user et oter un dislike
          }
          else error
        }
        else if numLikeSent = 1 {}
          comptabiliser like ou dislike et ajout ou retrait userid au tableau usersliked ou usersdisliked
          .then(() => { res.status(200).json({message: ''})})
          .catch(error)
        } */
      /*
      }) */
      
}


/* likes: { type: Number },
  dislikes: { type: Number},
  usersLiked: [ { type: String } ],
  usersDisliked: [ { type: String } ] 
  Sauce.cidessus */