import multer from "multer";
import express from "express";

export const multerInit = (app) =>
{
    const storage = multer.diskStorage( // Var name must be "storage"
    {
        destination: (_, __, cb) =>
        {
            cb(null, "images");
        },
        filename: (_, file, cb) => 
        {
            cb(null, Date.now() + "-" + file.originalname);
        }
    }
);

const upload = multer(
    {
        storage: storage,
        fileFilter: (req, file, cb) =>
        {
            const allowedExtensions = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/gif"];
            if (allowedExtensions.includes(file.mimetype)) { return cb(null, true); }
            else { return cb(new Error("Only JPG/JPEG, PNG and GIF files are allowed"), false); }
        },
        limits:
        {
            fileSize: 26214400
        }
    });

app.use("/images", express.static("images")); // Tell express that we want to make a get request to get a static file

app.post("/upload", /* checkAuth, */ upload.single("image"), (req, res) =>
{
    try
    {
        res.status(201).json(
            {
                url: `/images/${req.file.filename}` // Send the client the path of the image
            });
    }
    catch (error)
    {
        console.warn(error);
        res.status(500).json({ errorMessage: "Could not upload the image" });
    }
});
}