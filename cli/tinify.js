
const tinify = require("tinify");
tinify.key = process.env.TINIFY_API_KEY

let argv = [].concat(process.argv);

let fromPath = null;
let toPath = null;

if (argv.length > 2) {
    fromPath = argv[2].trim()
}

if (argv.length > 3) {
    toPath = argv[3].trim()
}

if (fromPath && !toPath) {
    toPath = fromPath
}

if (!fromPath) {
    console.log('Please specify a path!')
    return
}

const source = tinify.fromFile(fromPath);
source.toFile(toPath);