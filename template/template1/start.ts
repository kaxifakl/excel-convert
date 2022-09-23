import path from 'path';
import fs from 'fs';
import { ExcelConvert } from '../../src/index'

let url = path.join(__dirname, '../../test/test.xlsx');
let buffer = fs.readFileSync(url);
let ec = new ExcelConvert();

ec.excelConfig.mode = 1;
ec.excelConfig.defaultSignLine = {
    1: [ec.excelConfig.DEFAULT_SIGN.default],
    2: [ec.excelConfig.DEFAULT_SIGN.annotation],
    3: [ec.excelConfig.DEFAULT_SIGN.key],
    4: [ec.excelConfig.DEFAULT_SIGN.type],
}
ec.excelConfig.defaultSignParse['@'] = (sheet, array) => {
    sheet['mulKey'] = array[0];
    sheet['mainKey'] = '';
}
ec.excelConfig.getSheetObject = (sheet) => {
    let obj = {};
    let mulKeys = sheet['mulKey'].split(',');
    mulKeys = mulKeys.filter((value) => {
        return value != null && value != ''
    })
    for (let data of sheet.jsonObject) {
        let valueArray: any[] = [];
        for (let key of mulKeys) {
            valueArray.push(data[key]);
        }
        obj[valueArray.join('_')] = data;
    }
    return obj;
}

let excelBook = ec.parse(buffer, 'test');
let obj = excelBook.getJsonObject();
fs.writeFileSync(path.join(__dirname, 'test.json'), JSON.stringify(obj))
console.log(obj);