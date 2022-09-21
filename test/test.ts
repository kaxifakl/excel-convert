import path from 'path';
import fs from 'fs';
import { ExcelConvert } from '../src/index'

let url = path.join(__dirname, '../test/test.xlsx');
let buffer = fs.readFileSync(url);
let excelBook = new ExcelConvert().parse(buffer, 'test');
let obj = excelBook.getJsonObject();
console.log(obj);