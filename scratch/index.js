const async = require('async');
const jimp = require('jimp');
const AWS = require('aws-sdk');

const S3 = new AWS.S3();
    // made bucket public to open objects into browser
    // refactor naar named functions? Zie: https://caolan.github.io/async/docs.html#waterfall
    
    var params = {
      Bucket: "mn-image-bucket",
      Key: "images/CANTONA.jpg"
     };    

  async.waterfall(
    [ 
      function download(next){
            S3.getObject(params, next);
      }
      ,
      function loadImage(object, next){
          jimp.read(object.Body, next);
      }
      ,
      function transform(image, next){
          console.log("Read image: Width: "+ image.bitmap.width + ", Height:" + image.bitmap.height);
          image.scan(0,0,image.bitmap.height, image.bitmap.width, (x,y,idx) => {
              image.bitmap.data[ idx + 0 ] = 255 - image.bitmap.data[ idx + 0 ]; // Red
              image.bitmap.data[ idx + 1 ] = 255 - image.bitmap.data[ idx + 1 ]; // Green
              image.bitmap.data[ idx + 1 ] = 255 - image.bitmap.data[ idx + 2 ]; // Blue
          }, next);
          console.log("Finished transformation");
      }
      ,
      function i2b(image, next){
          // convert the image structure to a buffer to pass on to our uploader
          image.getBuffer(jimp.AUTO, next);
      }
      ,
      function upload(image, next){
        console.log('Start S3 write');
        // augment params for request
        params.Key = 'inverted/' + params.Key.split('/')[1];
        params.Body = image;
        params.ContentType = 'image/jpeg';  // specify the mime type for easy access
        params.ACL = 'public-read';         // set public access for browser viewing
        S3.putObject(params, next);
        console.log('End S3 put write');
      }
    ]
    ,
    function (err, next){
      if (err){
          console.log('Error:', err);
      } else
        console.log('Alles Okay');
    }
  );
