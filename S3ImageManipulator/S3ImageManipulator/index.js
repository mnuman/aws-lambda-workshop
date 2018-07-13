const AWS = require('aws-sdk');
const util = require('util');
const jimp = require('jimp');

exports.handler = (event, context, callback) => {
    console.log(util.inspect(event, { showHidden: true, depth: null }));
    const S3 = new AWS.S3();
    const bucket = event.Records[0].s3.bucket.name;
    const filekey = event.Records[0].s3.object.key;

    var params = {
      Bucket: bucket,
      Key: filekey
     };    

    S3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log("File size: " + data.ContentLength);
            jimp.read(data.Body, (err, image) => {
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    // here we can run image.scan and apply the function to every pixel in the range
                    // this lists some common manipulations
                    console.log("Image: " + image.bitmap.width + "x" + image.bitmap.height);
                    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                            // x, y is the position of this pixel on the image
                            // idx is the position start position of this rgba tuple in the bitmap Buffer
                            // this is the image
                            /* Invert: RGB = 255 _RGB, for each pixel
                             */
                            this.bitmap.data[ idx + 0 ] = 255 - this.bitmap.data[ idx + 0 ]; // RED
                            this.bitmap.data[ idx + 1 ] = 255 - this.bitmap.data[ idx + 1 ]; // GREEN
                            this.bitmap.data[ idx + 2 ] = 255 - this.bitmap.data[ idx + 2 ]; // BLUE
                    });
                    image.write('/tmp/sepia.jpg', (err, data) => {
                        if (err){
                            console.log(err);
                            callback(err);
                        } else {
                            callback();
                        }
                    }
                    
                    // image.getBuffer(jimp.MIME_JPEG, (err,data) => {
                    //     if (err){
                    //         console.log(err);
                    //         callback(err);
                    //     } else {
                    //     params.Key = 'sepia/' + params.Key.split('/')[1];
                    //     params.Body = data;
                    //     console.log(params.Key);
                    //     jimp.write(;
                        // callback();
                        // Simply putobject in sepia folder
                        // S3.putObject(params, (err, data) => {
                        //     if (err) { 
                        //         console.log(err);
                        //         callback(err);
                        //     } else {
                        //         callback();
                        //     }
                        // } );
                    //     }
                    // });
                    
                }
            });
        }
    });
};
