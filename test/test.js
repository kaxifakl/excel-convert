let excelconvert = require('../excelconvert/excelconvert');

let fs = require('fs');
let path = require('path');
let url = path.join(__dirname + '/test.xlsx');
let buffer = fs.readFileSync(url);

excelconvert.convert(new Uint8Array(buffer))