import { read, WorkBook } from 'xlsx';
import { ExcelBook } from './core/excel-book';
import { ExcelSheet } from './core/excel-sheet';
import { ExcelConfig } from './excel-config';

export class ExcelConvert {
    private static _default: ExcelConvert = null;
    public static get default(): ExcelConvert {
        if (!this._default) {
            this._default = new ExcelConvert();
        }
        return this._default;
    }

    public excelConfig: ExcelConfig = new ExcelConfig();

    public parse(data: Uint8Array, fileName: string): ExcelBook {
        let workBook = read(data, { type: 'buffer' });
        return this.formatData(workBook, fileName);
    }

    /**表格数据格式化 */
    private formatData(workBook: WorkBook, fileName: string): ExcelBook {
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

            excelBook.sheets.push(new ExcelSheet(workSheetName, sheet, this.excelConfig, excelBook.name))
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
};

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
        } else {
            continue;
        }
    }
    return newArray;
};

/**是否转置 */
function isTranspose(array, sign) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == null) {
            continue;
        }
        sign = sign || '@T'
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