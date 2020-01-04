
const S3 = require('aws-sdk/clients/s3');

let args = process.argv.slice(2);

if (args.length === 0) {
  throw new Error('No bucket names provided');
}

let s3 = new S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET
});

let promises = args.map(bucketName =>
  new Promise((resolve, reject) => {
    s3.createBucket({
      Bucket: bucketName,
      ACL: 'public-read'
    }, (err, _) => {
      if (err) reject(err);
      else resolve();
    });
  })
);

Promise.all(promises)
  .then(() => console.log('Buckets created'))
  .catch(err => {
    throw err;
  });
