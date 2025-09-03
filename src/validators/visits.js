import Joi from "joi";
export const scheduleSchema = Joi.object({
  property_id: Joi.number().integer().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  message: Joi.string().allow("", null)
});

export const respondSchema = Joi.object({
  visit_id: Joi.number().integer().required(),
  status: Joi.string().valid("accepted","rejected").required(),
  owner_response: Joi.string().allow("", null)
});

