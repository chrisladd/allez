
const allez = require('../index.js')
const Path = require('path');
const DEFAULT_BUCKET = 'xkdj3i2h';

function localPathForArgv(argv) {
    let localPath = null;
    if (argv.length > 2) {
      localPath = argv[2].trim();
    }

    return localPath;
}

function uniqueFilenameFromPath(path) {
    let hash = (+new Date).toString(36);
    let filename = Path.basename(path);

    if (filename.indexOf('.') > 0) {
        return filename.replace('.', '-' + hash + '.')
    }

    return null;
}

function bucketForArgv(argv) {
    let bucket = DEFAULT_BUCKET;
    if (argv.length > 4) {
      bucket = argv[4].trim();
    }

    return bucket;
}

function folderForArgv(argv) {
    let folder = null;
    if (argv.length > 3) {
      folder = argv[3].trim();
    }

    return folder;
}

let localPath = localPathForArgv(process.argv);
let bucket = bucketForArgv(process.argv);
let folder = folderForArgv(process.argv);
let name = uniqueFilenameFromPath(localPath)

console.log(`uploading ${localPath} to ${bucket}, in folder ${folder}... (${name})`)

allez.upload(localPath, bucket, {
    folder: folder,
    name: name
}, function(url, err) {
    if (err) {
        console.log('error: ');
        console.log(err);
    }
    else {
        console.log(`uploaded to ${url}`)
        console.log('it has been my pleasure to serve you')
    }
})
