import { validationResult } from "express-validator";

export default (req, res, next) =>
{
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) { return res.status(400).json(validationErrors.array()); }

    next();
};