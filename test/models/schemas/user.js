const Joi = require('joi')

module.exports = Joi.object().keys({
    id: Joi.any().optional(),
    firstname: Joi.string().optional(),
    lastname: Joi.string().optional(),
    favorites: Joi.object().optional(),
    order: Joi.any(),
    preferences: Joi.array()
})
