const { z } = require('zod');

const createAnnouncementSchema = z.object({
  title: z.string().min(3).max(100),
  body: z.string().min(10).max(2000),
  audience: z.enum(['all', 'staff', 'students']).default('all'),
});

function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten(),
      });
    }
    req.validatedBody = parsed.data;
    return next();
  };
}

module.exports = {
  createAnnouncementSchema,
  validateBody,
};
