const Sauce = require('../models/sauce-model');
const fs = require('fs');
const { log } = require('console');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  sauceObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  const sauce = new Sauce(sauceObject);
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => { res.status(200).json(sauce); })
    .catch((error) => {
      res.status(404).json({ error: error });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({ error: error });
    });
};

exports.likeOrDislike = (req, res, next) => {
  //findOne cherche un document dont les conditions sont l'id de l'utilisateur inclus dans l'URL/la route
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      //Récupéaration de la requête de l'utilisateur qui clique sur le like ou dislike
  switch (req.body.like) {
    case 1: 
    //Ajout de l'id du client qui demande la requête dans le tableau userLiked (lui-même ds array sauce)
    //Si l'id est déjà, la réponse renvoie un msg
    if (sauce.usersLiked.includes(req.body.userId)) {
      return res.status(400).json({ message:  "sauce déjà likée !" })
    } else {
      //Sinon, actualisation du tableau en ajoutant 1 au tableau likes et l'id de l'utilisateur dans le tableau userLiked
      Sauce.updateOne( {_id: req.params.id}, { $push: { usersLiked: req.body.userId }, $inc: { likes: 1 } } )
      .then(() => res.status(201).json({ message: "sauce likée !" }))
      .catch(error => res.status(400).json({ error }));
    } 
    break;
    case -1:
      //Même chose pour le tableau userDisliked et dislikes
      if (sauce.usersDisliked.includes(req.body.userId)) {
        return res.status(400).json({ message:  "sauce déjà dislikée !" })
      }  else {
        Sauce.updateOne( {_id: req.params.id}, { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: 1 } } )
      .then(() => res.status(201).json({ message: "sauce dislikée !" }))
      .catch(error => res.status(401).json({ error }));
      }
      break;
    case 0:
      //Condition qui retire 1 du tableau likes ou dislikes et retire l'id de l'utilisateur des tableaux userLiked ou userDisliked
      if (sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne( {_id: req.params.id}, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } } )
        .then(() => res.status(201).json({ message: "sauce unlikée !" }))      
      } else {
        Sauce.updateOne( {_id: req.params.id}, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } } )
        .then(() => res.status(201).json({ message: "sauce unlikée !" })) 
        .catch(error => res.status(402).json({ error }));     
      }
  }
    })
    .catch(error => res.status(500).json({ error }));
};