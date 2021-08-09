let excelconvert = require('../excelconvert/excelconvert');

let fs = require('fs');
let path = require('path');
let url = path.join(__dirname + '/test.xlsx');
let buffer = fs.readFileSync(url);

let json = excelconvert.convert(new Uint8Array(buffer))
console.log(require('../dist/excelconvert'));