import Joi from "joi";

export const registerSchema = Joi.object({
  full_name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow("", null),
  password: Joi.string().min(6).required(),
  user_type: Joi.string().valid("tenant", "owner").required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

