const express = require("express");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const ejs = require("ejs");
const path = require("path");
const download = require("image-downloader");

const config = require("./config.js");
aws.config.update({
  region: config.region,
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey
});

let s3 = new aws.S3();

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "wuproof",
    acl: "public-read",
    key: function(req, file, cb) {
      console.log(file);
      cb(null, file.originalname); //use Date.now() for unique file keys
    }
  }),
  limits: { fileSize: 1000000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single("myImage");

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// Init app
const app = express();

// EJS
app.set("view engine", "ejs");

// Public Folder
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("index"));

app.post("/upload", (req, res) => {
  upload(req, res, err => {
    if (err) {
      res.render("index", {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render("index", {
          msg: "Error: No File Selected!"
        });
      } else {
        let imageUrl = `https://wuproof.s3.amazonaws.com/${req.file.originalname}`;
        console.log("imageURL , ", imageUrl);
        const imageoptions = {
          url: imageUrl,
          dest: "./images" // Save to /path/to/dest/image.jpg
        };

        download
          .image(imageoptions)
          .then(({ filename, image }) => {
            console.log("File saved to", filename);
            imagedata = require("fs").readFileSync(`${filename}`);

            var ExifImage = require("exif").ExifImage;
            console.log(imagedata);
            try {
              new ExifImage({ image: imagedata }, function(error, exifData) {
                if (error) console.log("Error: " + error.message);
                else console.log(exifData); // Do something with your data!
              });
            } catch (error) {
              console.log("Error: " + error.message);
            }
          })
          .catch(err => {
            console.error(err);
          });

        res.render("index", {
          msg: "File Uploaded!",
          file: `https://wuproof.s3.amazonaws.com/${req.file.originalname}`
        });
      }
    }
  });
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
