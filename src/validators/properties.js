import Joi from "joi";
export const propertySchema = Joi.object({
  title: Joi.string().required(),
  price: Joi.number().integer().min(0).required(),
  type: Joi.string().required(),
  status: Joi.string().valid("available", "rented").required(),
  surface: Joi.number().integer().min(0).allow(null),
  rooms: Joi.number().integer().min(0).allow(null),
  bedrooms: Joi.number().integer().min(0).allow(null),
  bathrooms: Joi.number().integer().min(0).allow(null),
  address: Joi.string().allow("", null),
  city: Joi.string().required(),
  whatsapp: Joi.string().allow("", null),
  description: Joi.string().allow("", null),
  amenities: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string().uri()).default([])
});

