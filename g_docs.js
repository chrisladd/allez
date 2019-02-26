
const jsdoc2md = require('jsdoc-to-markdown')
const fs = require('fs');

let s = `# Allez

Allez puts things up in s3, simply.


## Usage

\`\`\`
const allez = require('@cgl2/allez');

allez.upload(filepath, bucket, {
    folder: 'allez'
}, function(url, error){
    console.log(url);
})

// the upload method is aliased to \`oop\`. just for fun.
allez.oop(dirpath, bucket, null, function(url, error){
    console.log(url);
})

// options and callback are optional
allez.oop(filepath, bucket)
\`\`\`

## CLI

For quick uploads, you can add an alias to the \`upload\` script in the \`cli\` folder:

\`alias allez='node ~/dev/allez/cli/upload.js'\`

Usage:
\`allez LOCALPATH FOLDER BUCKET\`

Folder and bucket are both optional. So, for example:
\`allez file.png\` 

is all you need to upload an image in the current directory to the default bucket.

`

const docs = jsdoc2md.renderSync({ files: 'index.js' })

s += docs;

s += `> This file is automatically generated. See \`g_docs.js\` to make additions.`

fs.writeFileSync('README.md', s);


