
//Package de cryptage 'brcypt' pour mot de passe

const bcrypt = require('bcrypt');

//Package de création et vérification des token

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const passwordValidator = require('../middleware/password-validator');

exports.signup = (req, res, next) => {
  if (!passwordValidator.validate(req.body.password)) {
    return res.status(401).json({ error: 'Mot de passe invalide !' });
  }
// Fonction qui crypte le mdp
  bcrypt.hash(req.body.password, /*salt: algorithme de hashage*/ 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id, email:maskEmail(req.body.email) },
              //Clé secrète
              process.env.jwtsecret,
              //Limite d'expiration du token
              { expiresIn: '24h' }
            )
          });
          console.log(maskEmail(req.body.email));
        })
        .catch(error => {
          console.log(error)
         return res.status(502).json({ error })}
        );
    })
    .catch(error => res.status(501).json({ error }));
};

function maskEmail (email) {
  const mailParts = email.split('@');
  const partLeft = obfuscate(mailParts[0]);
  const partRight = obfuscate(mailParts[1]);
  return partLeft + '@' + partRight;
};

function obfuscate (strings) {
  let output = '';
  for (let i=0; i < strings.length; i++) {
    if (i >= strings.length/4) {
      output += '*';
    } else {
      output += strings[i];
    }
  }
  return output
};