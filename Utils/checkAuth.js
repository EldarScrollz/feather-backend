import jwt from "jsonwebtoken";

export default (req, res, next) =>
{
    const jsonWebToken = (req.headers.authorization || "").replace(/Bearer\s?/, "");

    if (jsonWebToken)
    {
        try
        {
            const decodedToken = jwt.verify(jsonWebToken, process.env.ACCESS_TOKEN_SECRET);
            req.userId = decodedToken._id;

            next();
        }
        catch (error) 
        {
            return res.status(403).json({ errorMessage: "Access denied, wrong jsonWebToken" });
        }
    }
    else
    {
        return res.status(401).json({ errorMessage: "User must be signed in" });
    }
};