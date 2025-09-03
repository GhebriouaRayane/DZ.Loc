import Joi from "joi";
export const startConversationSchema = Joi.object({
  property_id: Joi.number().integer().required(),
  other_user_id: Joi.string().uuid().required()
});

export const sendMessageSchema = Joi.object({
  conversation_id: Joi.number().integer().required(),
  content: Joi.string().min(1).required()
});

