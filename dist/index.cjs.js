'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var xlsx = require('xlsx');

class ExcelBook {
    constructor(excelConfig) {
        this.excelConfig = null;
        this.name = null;
        this.sheets = [];
        this.excelConfig = excelConfig;
    }
    getJsonObject() {
        let obj = {};
        for (let sheet of this.sheets) {
            obj[sheet.name] = sheet.getJsonObject();
        }
        return obj;
    }
}

class ExcelSheet {
    constructor(name, sourceData, excelConfig) {
        this.name = null;
        this.excelConfig = null;
        this.sourceData = null;
        this.mainKey = null;
        this.configArray = null;
        this.keyArray = null;
        this.typeArray = null;
        this.dataArray = [];
        this.jsonObject = null;
        this.name = name;
        this.sourceData = sourceData;
        this.excelConfig = excelConfig;
        this.parse();
    }
    parse() {
        let mainKeyIndex = null;
        for (let i = 0; i < this.sourceData.length; i++) {
            let array = this.sourceData[i];
            let head = array[this.excelConfig.signIndex];
            let DEFAULT_SIGN = this.excelConfig.DEFAULT_SIGN;
            if (head === DEFAULT_SIGN.key) {
                array.splice(this.excelConfig.signIndex, 1);
                this.keyArray = array;
                continue;
            }
            else if (head === DEFAULT_SIGN.type) {
                array.splice(this.excelConfig.signIndex, 1);
                this.typeArray = array;
                continue;
            }
            else if (head == null || head == DEFAULT_SIGN.data) {
                array.splice(this.excelConfig.signIndex, 1);
                this.dataArray.push(array);
            }
            else if (head == DEFAULT_SIGN.default || DEFAULT_SIGN.isTranspose) {
                array.splice(this.excelConfig.signIndex, 1);
                this.configArray = array;
                for (let ele of this.configArray) {
                    if (ele == DEFAULT_SIGN.mainKey) {
                        mainKeyIndex = this.configArray.indexOf(ele);
                    }
                }
            }
        }
        if (mainKeyIndex != null && mainKeyIndex != -1) {
            this.mainKey = this.keyArray[mainKeyIndex];
        }
        this.jsonObject = [];
        for (let dataLine of this.dataArray) {
            let dataObject = {};
            for (let i = 0; i < this.keyArray.length; i++) {
                let keyStr = this.keyArray[i];
                if (keyStr == null) {
                    continue;
                }
                let typeStr = this.typeArray[i];
                if (typeStr == null) {
                    console.error(this.name + ':' + keyStr + '的类型为空值');
                    continue;
                }
                let dataStr = dataLine[i];
                if (dataStr == null) {
                    console.log(this.name + ':' + keyStr + '的数据存在空值');
                }
                let data = this.parseData(dataStr, typeStr);
                dataObject[keyStr] = data;
            }
            this.jsonObject.push(dataObject);
        }
    }
    parseData(dataStr, typeStr) {
        if (dataStr == null) {
            return this.excelConfig.defaultTypeValue[typeStr];
        }
        //中文符号替换
        let reg = this.excelConfig.reg;
        for (let i = 0; i < reg.length / 2; i++) {
            if (dataStr != null) {
                dataStr = dataStr.replace(new RegExp(reg[i], 'g'), reg[i + reg.length / 2]);
            }
        }
        let defaultTypeParse = this.excelConfig.defaultTypeParse[typeStr];
        if (defaultTypeParse != null) {
            return defaultTypeParse(dataStr);
        }
        return null;
    }
    getJsonObject() {
        if (this.mainKey != null) {
            let obj = {};
            for (let data of this.jsonObject) {
                obj[data[this.mainKey]] = data;
            }
            return obj;
        }
        else {
            return this.jsonObject;
        }
    }
}

class ExcelConfig {
    constructor() {
        this.DEFAULT_SIGN = {
            "isTranspose": "@T",
            "key": "$k",
            "type": "$t",
            "annotation": "//",
            "data": "$d",
            "default": "@",
            "mainKey": "$m"
        };
        this.reg = [
            "！", "，", "。", "；", "~", "《", "》", "（", "）", "？",
            "”", "｛", "｝", "“", "：", "【", "】", "”", "‘", "’",
            "!", ",", ".", ";", "`", "<", ">", "(", ")", "?",
            "'", "{", "}", "\"", ":", "{", "}", "\"", "\'", "\'"
        ];
        /**标记索引位置 */
        this.signIndex = 0;
        this.defaultTypeValue = {
            "number": 0,
            "string": '',
            "boolean": false,
            "number[]": [],
            "string[]": [],
            "boolean[]": [],
            "object": null
        };
        this.defaultTypeParse = {
            "number": (value) => { return parseFloat(value); },
            "string": (value) => { return value; },
            "boolean": (value) => {
                if (value === 'true') {
                    return true;
                }
                return false;
            },
            "number[]": (value) => {
                let numberArray = value.split(',');
                let array = [];
                for (let numStr of numberArray) {
                    array.push(parseFloat(numStr));
                }
                return array;
            },
            "string[]": (value) => {
                let strArray = value.split(',');
                return strArray;
            },
            "boolean[]": (value) => {
                let boolStrArray = value.split(',');
                let boolArray = [];
                for (let str of boolStrArray) {
                    if (str == 'true') {
                        boolArray.push(true);
                        continue;
                    }
                    boolArray.push(false);
                }
                return boolArray;
            },
            "object": (value) => {
                return JSON.parse(value);
            }
        };
    }
}

class ExcelConvert {
    constructor() {
        this.excelConfig = new ExcelConfig();
    }
    parse(data, fileName) {
        let workBook = xlsx.read(data, { type: 'buffer' });
        return this.formatData(workBook, fileName);
    }
    parseConfig(config) {
        // config.isTranspose && (this.config.isTranspose = config.isTranspose);
    }
    formatData(workBook, fileName) {
        let workSheetNames = workBook.SheetNames;
        let workSheets = workBook.Sheets;
        let excelBook = new ExcelBook(this.excelConfig);
        excelBook.name = fileName;
        for (let workSheetName of workSheetNames) {
            let workSheet = workSheets[workSheetName];
            let sheet = objectToArray(workSheet);
            if (sheet.length == 0) {
                continue;
            }
            //旋转表格方向
            if (isTranspose(sheet, this.excelConfig.DEFAULT_SIGN.isTranspose)) {
                sheet = transposeArray(sheet);
            }
            //去除空单元格
            sheet = trimArray(sheet);
            excelBook.sheets.push(new ExcelSheet(workSheetName, sheet, this.excelConfig));
        }
        return excelBook;
    }
}
/**将excel表对象转换为数据组 */
function objectToArray(obj) {
    let arr = [];
    for (var key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        if (key.toString() == '!ref' || key.toString() == '!margins') {
            continue;
        }
        let indexArray = formatKey(key);
        if (arr[indexArray[1]] == null) {
            arr[indexArray[1]] = [];
        }
        arr[indexArray[1]][indexArray[0]] = obj[key].w;
    }
    return arr;
}
/**转换excel的key */
function formatKey(key) {
    let keyArray = key.split('');
    let yindex = 0;
    let mul = 1;
    while (!isNaN(parseInt(keyArray[keyArray.length - 1]))) {
        let num = parseInt(keyArray.pop());
        yindex = yindex + num * mul;
        mul *= 10;
    }
    let keyNum = 0;
    let len = keyArray.length;
    for (let i = 0; i < len; i++) {
        let str = keyArray[i];
        let num = str.charCodeAt(0);
        if (num >= 65 && num <= 90) {
            num -= 64;
        }
        let value = Math.pow(26, len - 1 - i) * num;
        keyNum += value;
    }
    return [keyNum, yindex];
}
/**去除表格空数据 */
function trimArray(array) {
    let newArray = [];
    let minLen = null;
    for (let arr of array) {
        if (arr != null) {
            let isAllNull = true;
            for (let item of arr) {
                if (item != null) {
                    isAllNull = false;
                    break;
                }
            }
            if (isAllNull) {
                continue;
            }
            newArray.push(arr);
            if (minLen == null || arr.length < minLen) {
                minLen = arr.length;
            }
        }
    }
    let len = newArray.length;
    for (let i = minLen - 1; i >= 0; i--) {
        let need = true;
        for (let j = 0; j < len; j++) {
            if (newArray[j][i] != null) {
                need = false;
                break;
            }
        }
        if (need) {
            for (let arr of newArray) {
                arr.splice(i, 1);
            }
        }
        else {
            continue;
        }
    }
    return newArray;
}
/**是否转置 */
function isTranspose(array, sign) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == null) {
            continue;
        }
        sign = sign || '@T';
        if (array[i].includes(sign)) {
            return true;
        }
    }
}
/**数组转置 */
function transposeArray(array) {
    let newArray = [];
    for (let i = 0; i < array.length; i++) {
        let line = array[i];
        if (line == null || line.length == 0) {
            continue;
        }
        for (let j = 0; j < line.length; j++) {
            if (newArray[j] == null) {
                newArray[j] = [];
            }
            newArray[j][i] = array[i][j];
        }
    }
    return newArray;
}

exports.ExcelBook = ExcelBook;
exports.ExcelConfig = ExcelConfig;
exports.ExcelConvert = ExcelConvert;
exports.ExcelSheet = ExcelSheet;
