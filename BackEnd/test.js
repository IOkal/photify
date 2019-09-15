
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyA54nJFeUvJHWcl3U0Sy9LYKZuvDDtu2Yk', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
 
var geocoder = NodeGeocoder(options);


let imagedata = require('fs').readFileSync(`./images/IMG_2340.jpg`);

var ExifImage = require('exif').ExifImage;
console.log(imagedata);
try {
    new ExifImage({ image : imagedata }, async function (error, exifData) {
        if (error)
            console.log('Error: '+error.message);
        else{


              quickstart().catch(console.error);


        }
        

    });
} catch (error) {
    console.log('Error: ' + error.message);
}


async function quickstart() {
    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');
  
    // Creates a client
    const client = new vision.ImageAnnotatorClient();
  
    // Performs label detection on the image file
    const [result] = await client.landmarkDetection('./images/IMG_2340.jpg');
    const landmarks = result.landmarkAnnotations;
    console.log('Landmarks:');
    landmarks.forEach(landmark => console.log(landmark));
  }
  // [END vision_quickstart]
  