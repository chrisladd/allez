
const s3 = require('s3');
const Path = require('path');
const fs = require('fs');

function getClient(s3Options) {
  let client = s3.createClient({
    maxAsyncS3: 20,     // this is the default
    s3RetryCount: 3,    // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
    s3Options: s3Options
    // s3Options: {
    //   accessKeyId: "your s3 key",
    //   `: "your s3 secret",
    //   // any other options are passed to new AWS.S3()
    //   // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  // },
  });

  return client;
}

/**
*   Uploads a file, or the contents of a directory to s3
*
*  @param fileOrDirectoryPath {string} - the relative path to the file or directory. If it's a directory, its contents will be uploaded. If it's a file, the file itself will be uploaded.
*  @param bucket {string} - the bucket to push to
*  @param {Object} options - options to control upload
*  @param {string} options.folder - the remote directory to push content to
*  @param {string} options.acl - the acl to apply. `public-read` by default
*  @param {string} options.name - the remote name to use for this file. If none is supplied, the file will have the same name as the local file.
*  @param {boolean} options.deleteRemoved - in the case of directory uploads, setting this option to `true` will delete any remote files not present in the local folder. `false` by default.
*  @param {Object} options.s3Options - s3Options to pass to the s3 client. This contains `accessKeyId` and `secretAccessKey`, to allow you to customize your credentials. By default, allez will use the default s3 credentials on your machine.

*   @param completion {uploadCompletion} - a completion to fire once done
*
*/
module.exports.upload = function(fileOrDirectoryPath, bucket, options, completion) {
  if (fs.lstatSync(fileOrDirectoryPath).isDirectory()) {
    uploadDirectory(fileOrDirectoryPath, bucket, options, completion);
  }
  else {
    uploadFile(fileOrDirectoryPath, bucket, options, completion);
  }
}

/**
*  a fun alias for `upload`
*/
module.exports.oop = module.exports.upload;

/**
 * A completion to fire on success, or failure, pushing items to s3.
 * @callback uploadCompletion
 * @param {string} url
 * @param {Object} error
 */

function uploadDirectory(directoryPath, bucket, options, completion) {
    if (!options) {
      options = {};
    }

    let client = getClient(options.s3Options);

    let deleteRemoved = false;
    if (options.deleteRemoved) {
        deleteRemoved = options.deleteRemoved;
    }

    let remoteDir = '';
    if (options.folder) {
      remoteDir = options.folder;
    }

    let acl = 'public-read';
    if (options.acl) {
      acl = options.acl;
    }

    var params = {
      localDir: directoryPath,
      deleteRemoved: deleteRemoved, // default false, whether to remove s3 objects
      s3Params: {
        Bucket: bucket,
        Prefix: remoteDir,
        ACL: acl
        // other options supported by putObject, except Body and ContentLength.
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
      },
    };
    
    var uploader = client.uploadDir(params);
    
    uploader.on('progress', function() {
      // console.log("progress", uploader.progressAmount, uploader.progressTotal);
    });
    
    uploader.on('error', function(err) {
        completion(null, err);
    });
    
    uploader.on('end', function() {
        let url = `https://s3.amazonaws.com/${bucket}/${remoteDir}`
        if (completion) {
          completion(url, null);  
        }
        
    });
};

function uploadFile(fromPath, bucket, options, completion) {
    if (!options) {
      options = {};
    }

    let client = getClient(options.s3Options);

    let filename = Path.basename(fromPath);
    let remoteFilename = filename;
   
    if (options.name && options.name.length > 0) {
      remoteFilename = options.name;
    }

    let remotePath = remoteFilename;

    if (options.folder) {
      let folder = options.folder;
      let lastChar = folder.substring(folder.length - 1);
      if (lastChar != '/') {
        folder = folder + '/';
      }
      
      remotePath = folder + remoteFilename;
    }

    let acl = 'public-read';
    if (options.acl) {
      acl = options.acl;
    }

    var params = {
        localFile: fromPath,
 
        s3Params: {
            Bucket: bucket,
            Key: remotePath,
            ACL: acl
            // other options supported by putObject, except Body and ContentLength.
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        }
    };

    var uploader = client.uploadFile(params);
    uploader.on('error', function(err) {
        if (completion) {
          completion(null, err);
        }
    });
    
    uploader.on('end', function() {
        let url = `https://s3.amazonaws.com/${bucket}/${remotePath}`
        if (completion) {
          completion(url, null);
        }
    });
}
