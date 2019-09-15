
var NodeGeocoder = require('node-geocoder');
var axios = require('axios');

async function abc(){

    await axios.get(`https://api.spotify.com/v1/search`, {
        params: {
            q: "Toronto",
            type: "playlist",
            limit: 1
        }, 
        headers: {
            Authorization: 'Bearer BQB5UtUruIOT7BQ0_W1N3aLMuCHVRnM0QJXOgivu28NQqn_B6WfX2LUMc5gZRDP6RUaN5sh9PSMBpXM9-GfyC3MNoLHb0gEyVc25okfLHLh2Twdm6QKi3eEUy6yXr0Meek4_ELHN0J2NwYqPScITdEuAUpv9OlG4WtPUgw'
        }
      })
      .then((res) => res.data)
      .then((res) => console.log(res.playlists.items[0].external_urls.spotify))
      .catch((err) => {
        console.log(err.message);
      });
    
}

abc();

// var options = {
//   provider: 'google',
 
//   // Optional depending on the providers
//   httpAdapter: 'https', // Default
//   apiKey: 'AIzaSyA54nJFeUvJHWcl3U0Sy9LYKZuvDDtu2Yk', // for Mapquest, OpenCage, Google Premier
//   formatter: null         // 'gpx', 'string', ...
// };
 
// var geocoder = NodeGeocoder(options);


// let imagedata = require('fs').readFileSync(`./images/IMG_2340.jpg`);

// var ExifImage = require('exif').ExifImage;
// console.log(imagedata);
// try {
//     new ExifImage({ image : imagedata }, async function (error, exifData) {
//         if (error)
//             console.log('Error: '+error.message);
//         else{


//               quickstart().catch(console.error);


//         }
        

//     });
// } catch (error) {
//     console.log('Error: ' + error.message);
// }


// async function quickstart() {
//     // Imports the Google Cloud client library
//     const vision = require('@google-cloud/vision');
  
//     // Creates a client
//     const client = new vision.ImageAnnotatorClient();
  
//     // Performs label detection on the image file
//     const [result] = await client.landmarkDetection('./images/IMG_2340.jpg');
//     const landmarks = result.landmarkAnnotations;
//     console.log('Landmarks:');
//     console.log(landmarks[0].description);
//     // landmarks.forEach(landmark => console.log(landmark.Landmarks));
//   }
//   // [END vision_quickstart]
  