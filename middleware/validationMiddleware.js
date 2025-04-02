const { z } = require("zod");

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.string().min(2),
});

exports.validateProduct = (req, res, next) => {
  try {
    productSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ message: error.errors });
  }
};
