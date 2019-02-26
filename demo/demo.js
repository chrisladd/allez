
const path = require('path');
const allez = require(path.join(__dirname,'../index.js'));

let bucket = 'cgldemo';
let filepath = path.join(__dirname,'../README.md');
let dirpath = path.join(__dirname,'.');

allez.uploadFile(filepath, bucket, {
    folder: 'allez'
}, function(url, error){
    console.log(url);
})

allez.uploadDirectory(dirpath, bucket, {
    folder: 'allez-demo'
}, function(url, error){
    console.log(url);
})
