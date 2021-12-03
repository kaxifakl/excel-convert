let excelconvert = //require('../dist/excelconvert.min')
    //require('../excelconvert/excelconvert');
    require('../dist/excelconvert')
let fs = require('fs');
let path = require('path');
let url = path.join(__dirname + '/test.xlsx');
let buffer = fs.readFileSync(url);

//test DefaultTypeValue
excelconvert.setDefaultTypeValue('object', { value: null })
globalThis.excelconvert.addCustomTypeParse('obj', (data) => {
    return parseInt(data) + 1;
})

globalThis.excelconvert.setCustomConvert((excelData, fileName) => {
    if (fileName != 'test') {
        return;
    }
    excelData.table[0].count = 1111;
    console.log(excelData);
});


let json = excelconvert.convert(new Uint8Array(buffer), 'test')
json.table = excelconvert.arrayToObject(json.table, 'id');
console.log(JSON.stringify(json));