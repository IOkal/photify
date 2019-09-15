const express = require("express");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const ejs = require("ejs");
const path = require("path");
const download = require("image-downloader");
const axios = require('axios');

const config = require("./config.js");
aws.config.update({
  region: config.region,
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey
});

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyA54nJFeUvJHWcl3U0Sy9LYKZuvDDtu2Yk', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
 
var geocoder = NodeGeocoder(options);

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

app.post("/upload", async (req, res) => {
  upload(req, res, async err => {
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

        let queryData = '';

        await download
          .image(imageoptions)
          .then(async ({ filename, image }) => {
              console.log('File saved to', filename)
              imagedata = require('fs').readFileSync(`${filename}`);
        
                                                            
                        var ExifImage = require('exif').ExifImage;
                        console.log(imagedata);
                        try {
                            new ExifImage({ image : imagedata }, function (error, exifData) {
                                if (error)
                                    console.log('Error: '+error.message);
                                else {
                                  console.log(exifData.gps); // Do something with your data!

                                  if(exifData.gps.hasOwnProperty('GPSLatitude') && exifData.gps.hasOwnProperty('GPSLongitude')){
                                    console.log(`${exifData.gps.GPSLatitude[0]}.${exifData.gps.GPSLatitude[1]}`); // Do something with your data!
                                    console.log(`${exifData.gps.GPSLongitude[0]}.${exifData.gps.GPSLongitude[1]}`); // Do something with your data!
  
                                    geocoder.reverse({lat:`${exifData.gps.GPSLatitude[0]}.${exifData.gps.GPSLatitude[1]}`, lon:`-${exifData.gps.GPSLongitude[0]}.${exifData.gps.GPSLongitude[1]}`})
                                            .then(function(res) {
                                              console.log(res[0].city);
                                              queryData = res[0].city;
                                            })
                                            .catch(function(err) {
                                              console.log(err);
                                            });
                                  }

                                }
                            });
                        } catch (error) {
                            console.log('Error: ' + error.message);
                        }
                        console.log("queryData : ", queryData);


                        if(queryData.length == 0){
                          const vision = require('@google-cloud/vision');

                          // Creates a client
                          const client = new vision.ImageAnnotatorClient();
  
                          /**
                           * TODO(developer): Uncomment the following line before running the sample.
                           */
                          const fileName = imagedata;
  
                          // Performs landmark detection on the local file
                          try{
  
                            const [result] = await client.landmarkDetection(fileName);
                            const landmarks = result.landmarkAnnotations;
                            console.log('Landmarks: ', landmarks);
                            if(landmarks.length > 0){
                              console.log('Landmarks: ', landmarks[0].description);  
                              queryData = landmarks[0].description;
                            }
                            else{
                              queryData = 'Toronto';
                            }                    
                            
  
                          }
                          catch (e){
                            console.log(e);
                          }
                        }




          })
          .catch(err => {
            console.error(err);
          });

          
          if(queryData.length == 0){
            queryData = 'Toronto';
          }


        let spotifyUrl = await axios.get(`https://api.spotify.com/v1/search`, {
          params: {
              q: queryData,
              type: "playlist",
              limit: 1
          }, 
          headers: {
              Authorization: 'Bearer BQB5UtUruIOT7BQ0_W1N3aLMuCHVRnM0QJXOgivu28NQqn_B6WfX2LUMc5gZRDP6RUaN5sh9PSMBpXM9-GfyC3MNoLHb0gEyVc25okfLHLh2Twdm6QKi3eEUy6yXr0Meek4_ELHN0J2NwYqPScITdEuAUpv9OlG4WtPUgw'
          }
        })
        .then((res) => res.data)
        .then((res) => res.playlists.items[0].external_urls.spotify)
        .catch((err) => {
          console.log(err.message);
        });

        res.redirect(spotifyUrl);

        // res.render("index", {
        //   msg: "File Uploaded!",
        //   file: `https://wuproof.s3.amazonaws.com/${req.file.originalname}`
        // });
      }
    }
  });
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
