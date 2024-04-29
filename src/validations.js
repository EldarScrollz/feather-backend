import { body } from "express-validator";

// todo: migrate to Zod instead of express-validator?

//========================================================
// Auth
//========================================================
export const signUpValidation =
    [
        body("email").isLength({ max: 100 }).isEmail(),
        body("password").isLength({ min: 4, max: 1000 }),
        body("name").isLength({ max: 32 }),
        body("userAvatar").optional().isString()
    ];

export const signInValidation =
    [
        body("email").isLength({ max: 100 }).isEmail(),
        body("password").isLength({ max: 1000 }),
    ];

export const editUserValidation =
    [
        body("email").optional().isLength({ max: 100 }).isEmail(),
        body("password").optional().isLength({ min: 4, max: 1000 }),
        body("name").optional().isLength({ max: 32 }),
        body("userAvatar").optional().isString()
    ];



//========================================================
// Posts 
//========================================================
export const postValidation =
    [
        body("title").optional().isLength({ max: 200 }).isString(),
        body("text").optional().isLength({ max: 5000 }).isString(),

        body("tags").optional().isArray({ max: 3 }).custom((val) => val.join("").length <= 50),
        body("tags.*").isString(),

        body("postImg").optional().isString(),
    ];



//========================================================
//Comments 
//========================================================
export const commentValidation =
    [
        body("text").isLength({ max: 1000 }).isString(),
    ];