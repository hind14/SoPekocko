//Package de validation du mot de passe

const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)
.is().max(20)
.has().uppercase()
.has().lowercase()
.has().digits(2)
.has().not().spaces();

module.exports = passwordSchema;