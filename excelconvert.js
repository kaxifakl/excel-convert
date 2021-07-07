let excelconvert = function() {
    //符号替换
    this.regs = ["！", "，", "。", "；", "~", "《", "》", "（", "）", "？",
        "”", "｛", "｝", "“", "：", "【", "】", "”", "‘", "’", "!", ",",
        ".", ";", "`", "<", ">", "(", ")", "?", "'", "{", "}", "\"",
        ":", "{", "}", "\"", "\'", "\'"
    ];

    /**转换数据 */
    this.formatData = (workbook) => {
        let sheetNameArray = workbook.SheetNames;
        let sheets = workbook.Sheets;
        let obj = {}
        for (let name of sheetNameArray) {
            let sheet = sheets[name];
            let sheetArray = this.objectToArray(sheet);
            if (sheetArray.length == 0) {
                continue;
            }
            sheetArray = this.trimArray(sheetArray);
            this.convertToJson(obj, sheetArray, name);
        }
        let strData = JSON.stringify(obj);
        return { obj: obj, strData: strData }
    };

    /**将excel表对象转换为数据组 */
    this.objectToArray = (obj) => {
        let arr = [];
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }
            if (key.toString() == '!ref' || key.toString() == '!margins') {
                continue;
            }

            let indexArray = this.formatKey(key);
            if (arr[indexArray[1]] == null) {
                arr[indexArray[1]] = [];
            }
            arr[indexArray[1]][indexArray[0]] = obj[key].w;
        }
        return arr;
    }

    /**转换excel的key */
    this.formatKey = (key) => {
        let keyArray = key.split('');
        let yindex = parseInt(keyArray.pop());
        let keyNum = 0;
        for (let str of keyArray) {
            let num = str.charCodeAt(0);
            if (num >= 65 && num <= 90) {
                num -= 64;
                keyNum += parseInt(num);
            }
        }
        return [keyNum, yindex];
    };

    /**去除表格空数据 */
    this.trimArray = (array) => {
        let newArray = [];
        let minLen = 999999;
        for (let arr of array) {
            if (arr != null) {
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

    /**解析为Json对象 */
    this.convertToJson = (obj, sheetArray, sheetName) => {
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
                    continue;
                }
                let data = this.changeDateType(strData, type);
                newobj[key.key] = data;
            }
            obj[sheetName].push(newobj);
        }
    };

    /**转换数据类型 */
    this.changeDateType = (data, type) => {
        for (let i = 0; i < this.regs.length / 2; i++) {
            data = data.replace(this.regs[i], this.regs[i + this.regs.length / 2]);
        }

        if (type == 'number') {
            return parseInt(data);
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
                array.push(parseInt(numStr));
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
        }
        return null;
    }

}