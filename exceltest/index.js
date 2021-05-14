console.log(XLSX);
let regs = ["！", "，", "。", "；", "~", "《", "》", "（", "）", "？",
    "”", "｛", "｝", "“", "：", "【", "】", "”", "‘", "’", "!", ",",
    ".", ";", "`", "<", ">", "(", ")", "?", "'", "{", "}", "\"",
    ":", "{", "}", "\"", "\'", "\'"
];

let app = new Vue({
    el: "#app",
    data: {
        files: '',
        tex: ''
    },
    mounted() {

    },
    methods: {
        inputfile(e) {
            this.files = e.target.files[0];
            console.log(this.files)
            var reader = new FileReader();
            reader.onload = (e) => {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
                this.formatData(workbook);
            };
            reader.readAsArrayBuffer(this.files);
        },
        formatData(workbook) {
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
            this.tex = JSON.stringify(obj);
            console.log(obj);
        },

        objectToArray(obj) {
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
        },
        formatKey(key) {
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
        },
        trimArray(array) {
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
        },
        /**解析 */
        convertToJson(obj, sheetArray, sheetName) {
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
                    let data = this.changeDateType(strData, type);
                    newobj[key.key] = data;
                }
                obj[sheetName].push(newobj);
            }
        },
        changeDateType(data, type) {
            for (let i = 0; i < regs.length / 2; i++) {
                data = data.replace(regs[i], regs[i + regs.length / 2]);
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
    },
    computed: {

    }
})