const XLSX = require('./xlsx.mini.min');
/**中英文符号转换 */
const regs = [
    "！", "，", "。", "；", "~", "《", "》", "（", "）", "？",
    "”", "｛", "｝", "“", "：", "【", "】", "”", "‘", "’",
    "!", ",", ".", ";", "`", "<", ">", "(", ")", "?",
    "'", "{", "}", "\"", ":", "{", "}", "\"", "\'", "\'"
];

/**默认类型初始值 */
let defaultTypeValue = {
    "number": 0,
    "string": '',
    "boolean": false,
    "number[]": [],
    "string[]": [],
    "boolean[]": [],
    "object": null
}

/**自定义解析 */
let customParse = {}

/**自定义转换 */
let _customConvert = null;

let excelconvert = {
    XLSX: XLSX,
    /**转换为json */
    convert: (data, fileName) => {
        let workbook = XLSX.read(data, { type: 'array' });
        let excelData = formatData(workbook);
        if (_customConvert != null && fileName != null) {
            _customConvert(excelData, fileName);
        }
        return excelData;
    },
    /**转换为ts格式 */
    convertToTs: (fileName, jsonObj) => {
        let keys = Object.keys(jsonObj);
        let tsStr = 'export class ' + fileName + '{';
        for (let key of keys) {
            tsStr = tsStr + 'static ' + key.toString() + '=' + JSON.stringify(jsonObj[key]) + ';';
        }
        tsStr += '}'
        return tsStr;
    },
    /**设置默认类型初始值 */
    setDefaultTypeValue(type, value) {
        defaultTypeValue[type] = value;
    },
    /**获取默认类型初始值 */
    getDefaultTypeValue(type) {
        return defaultTypeValue[type];
    },
    /**添加自定义解析 */
    addCustomTypeParse(type, func) {
        customParse[type] = func;
    },
    /**设置解析完成后的自定义解析 */
    setCustomConvert(fuc) {
        _customConvert = fuc;
    },
    /**将数组数据转换为对象数据 */
    arrayToObject(dataArray, key) {
        if (dataArray == null || key == null) {
            console.error('传入值为空');
            return null;
        }
        let newObj = {};
        for (let i = 0; i < dataArray.length; i++) {
            let data = dataArray[i];
            if (data == null) {
                continue;
            }
            if (data[key] == null) {
                console.error('不存在改主键：' + key);
                continue;
            }
            newObj[data[key]] = dataArray[i];
        }
        return newObj;
    }
}

globalThis.excelconvert = module.exports = excelconvert;

/**转换数据 */
function formatData(workbook) {
    let sheetNameArray = workbook.SheetNames;
    let sheets = workbook.Sheets;
    let obj = {}
    for (let name of sheetNameArray) {
        let sheetObj = sheets[name];
        let sheetArray = objectToArray(sheetObj);
        if (sheetArray.length == 0) {
            continue;
        }
        sheetArray = trimArray(sheetArray);
        if (isTranspose(sheetArray)) {
            sheetArray = transposeArray(sheetArray);
            sheetArray = trimArray(sheetArray);
        }
        convertToJson(obj, sheetArray, name);
    }
    return obj;
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
};

/**去除表格空数据 */
function trimArray(array) {
    let newArray = [];
    let minLen = Infinity;
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
            if (arr.length < minLen) {
                minLen = arr.length;
            }
        }
    }
    for (let i = 0; i < minLen; i++) {
        let need = true;
        for (let arr of newArray) {
            if (arr[0] != null) {
                need = false;
            }
        }
        if (need) {
            for (let arr of newArray) {
                arr.shift();
            }
        } else {
            break;
        }
    }
    return newArray;
};

/**是否转置 */
function isTranspose(array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == null) {
            continue;
        }
        if (array[i][0] === '@T') {
            //TODO 更多字符规则
            return true;
        }
    }
}

/**数组转置 */
function transposeArray(array) {
    let newArray = [];
    for (let i = 0; i < array.length; i++) {
        let line = array[i];
        for (let j = 0; j < line.length; j++) {
            if (newArray[j] == null) {
                newArray[j] = [];
            }
            newArray[j][i] = array[i][j];
        }
    }
    return newArray;
}

/**解析为Json对象 */
function convertToJson(obj, sheetArray, sheetName) {
    let keyInfoArray = [];
    let typeInfoArray = null;
    let dataInfoArray = [];
    for (let strArray of sheetArray) {
        if (strArray == null || strArray.length == 0) {
            continue;
        }
        let head = strArray[0];
        switch (head) {
            case '$k':
                for (let j = 0; j < strArray.length; j++) {
                    let key = strArray[j];
                    if (key == null || key == '$k') {
                        continue;
                    }
                    keyInfoArray.push({ key: key, index: j })
                }
                break;
            case '$t':
                typeInfoArray = strArray;
                break;
            case '//':
                break;
            case '@':
                break;
            case '@T':
                break;
            case '$d':
            default:
                dataInfoArray.push(strArray);
                break;
        }
    }
    obj[sheetName] = [];

    let dataIndex = [];
    for (let key of keyInfoArray) {
        dataIndex.push(key.index);
    }

    for (let arr of dataInfoArray) {
        let newobj = {};
        for (let key of keyInfoArray) {
            let type = typeInfoArray[key.index];
            if (type == null) {
                continue;
            }
            let strData = arr[key.index];
            if (strData == null) {
                console.log(sheetName + ':' + key.key + '的数据存在空值');
            }
            let data = changeDateType(strData, type);
            newobj[key.key] = data;
        }
        obj[sheetName].push(newobj);
    }
};

/**转换数据类型 */
function changeDateType(data, type) {
    //中文符号替换
    for (let i = 0; i < regs.length / 2; i++) {
        if (data != null) {
            data = data.replace(new RegExp(regs[i], 'g'), regs[i + regs.length / 2]);
        }
    }

    if (data == null) {
        return defaultTypeValue[type];
    }

    if (type == 'number') {
        return parseFloat(data);
    }
    if (type == 'string') {
        return data;
    }
    if (type == 'boolean') {
        if (data == 'true') {
            return true;
        }
        if (data == 'false') {
            return false;
        }
    }
    if (type == 'number[]') {
        let numberArray = data.split(',');
        let array = [];
        for (let numStr of numberArray) {
            array.push(parseFloat(numStr));
        }
        return array;
    }
    if (type == "string[]") {
        let strArray = data.split(',');
        return strArray;
    }
    if (type == 'boolean[]') {
        let boolStrArray = data.split(',');
        let boolArray = [];
        for (let str of boolStrArray) {
            if (str == 'true') {
                boolArray.push(true);
            }
            if (str == 'false') {
                boolArray.push(false);
            }
        }
        return boolArray;
    }
    if (type == 'object') {
        return JSON.parse(data);
    }
    if (customParse[type] != null) {
        return customParse[type](data);
    }
    return null;
}