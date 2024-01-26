import { body } from "express-validator";

// Auth --------------------------------------------------
export const registerValidation =
    [
        body("email").isLength({ max: 100 }).isEmail(),
        body("password").isLength({ min: 4, max: 1000 }),
        body("name").isLength({ max: 32 }),
        body("userAvatar").optional().isString()
    ];

export const loginValidation =
    [
        body("email").isLength({ max: 100 }).isEmail(),
        body("password").isLength({ max: 1000 }),
    ];
//--------------------------------------------------------



// Posts -------------------------------------------------
export const postValidation =
    [
        body("title").isLength({ max: 200 }).isString().optional(),
        body("text").isLength({ max: 5000 }).isString().optional(),

        body("tags").isArray({ max: 3 }).custom((val) => val.join("").length <= 50).optional(),
        body("tags.*").isString(),

        body("postImg").isString().optional(),
    ];
//--------------------------------------------------------



//Comments -----------------------------------------------
export const commentValidation =
    [
        body("text").isLength({ max: 1000 }).isString(),
    ];
//--------------------------------------------------------