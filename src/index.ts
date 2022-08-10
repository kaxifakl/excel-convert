import { ExcelConvert } from "./excel-convert";

let fs = require('fs');
let path = require('path');
let url = path.join(__dirname, '../test/test.xlsx');
let buffer = fs.readFileSync(url);
let excelBook = new ExcelConvert().parse(buffer, 'test');
let obj = excelBook.getJsonObject();
console.log(obj);
