import path from 'path';
import fs from 'fs';
import { ExcelConvert } from '../../src/index'

let url = path.join(__dirname, '../../test/test.xlsx');
let buffer = fs.readFileSync(url);
let ec = new ExcelConvert();

ec.excelConfig.defaultSignParse['@'] = (sheet, array) => {
    sheet['mulKey'] = array[0];
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

let sheets = excelBook.sheets;
let sheet = sheets[0];
let keyArray = sheet.keyArray;
let typeArray = sheet.typeArray;

let outData: any = {}
outData.key = keyArray.concat([]).filter(value => value != null);
outData.data = [];
outData.index = {}
let index = 0;
for (let key in obj.table) {
    let data = obj.table[key];
    outData.index[key] = index++;
    let array: any = [];
    for (let keyStr of outData.key) {
        array.push(data[keyStr]);
    }
    outData.data.push(array);
}
fs.writeFileSync(path.join(__dirname, 'test.json'), JSON.stringify(outData))

