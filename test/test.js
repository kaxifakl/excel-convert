let excelconvert = //require('../dist/excelconvert.min')
    //require('../excelconvert/excelconvert');
    require('../dist/excelconvert')
let fs = require('fs');
let path = require('path');
let url = path.join(__dirname + '/test3.xlsx');
let buffer = fs.readFileSync(url);

let json = excelconvert.convert(new Uint8Array(buffer))
console.log(json);