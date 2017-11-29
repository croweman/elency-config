const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, process.argv[2]);
let content = fs.readFileSync(filePath).toString();
content = content.replace(/\n/g, '#NEWLINE#');
fs.writeFileSync(filePath, content);

