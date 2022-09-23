import { ExcelSheet } from "./core/excel-sheet";

export class ExcelConfig {
    /**内置标记 */
    public DEFAULT_SIGN = {
        /**是否转置 */
        "isTranspose": "@T",
        /**键 */
        "key": "$k",
        /**类型 */
        "type": "$t",
        /**注释 */
        "annotation": "//",
        /**数据 */
        "data": "$d",
        /**默认 */
        "default": "@"
    }

    public DEFAULT_TAG = {
        /**主键 */
        "mainKey": "$m",
    }

    public reg: string[] = [
        "！", "，", "。", "；", "~", "《", "》", "（", "）", "？",
        "”", "｛", "｝", "“", "：", "【", "】", "”", "‘", "’",
        "!", ",", ".", ";", "`", "<", ">", "(", ")", "?",
        "'", "{", "}", "\"", ":", "{", "}", "\"", "\'", "\'"
    ]

    /**标记索引位置 */
    public signIndex: number = 0;

    public defaultTypeValue = {
        "number": 0,
        "string": '',
        "boolean": false,
        "number[]": [],
        "string[]": [],
        "boolean[]": [],
        "object": null
    }

    public defaultTypeParse = {
        "number": (value: string) => { return parseFloat(value) },
        "string": (value: string) => { return value },
        "boolean": (value: string) => {
            if (value === 'true') {
                return true;
            }
            return false;
        },
        "number[]": (value: string) => {
            let numberArray = value.split(',');
            let array = [];
            for (let numStr of numberArray) {
                array.push(parseFloat(numStr));
            }
            return array;
        },
        "string[]": (value: string) => {
            let strArray = value.split(',');
            return strArray;
        },
        "boolean[]": (value: string) => {
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
        "object": (value: string) => {
            return JSON.parse(value);
        }
    }

    private defaultSignCall = (sheet: ExcelSheet, array: any[]) => {
        if (this.mode != 1) {
            array.splice(this.signIndex, 1);
        }
        for (let ele of array) {
            if (ele == this.DEFAULT_TAG.mainKey) {
                let mainKeyIndex = array.indexOf(ele);
                if (mainKeyIndex != null && mainKeyIndex != -1) {
                    sheet.mainKeyIndex = mainKeyIndex;
                }
            }
        }
    }

    public defaultSignParse = {
        [this.DEFAULT_SIGN.key]: (sheet: ExcelSheet, array: any[]) => {
            if (this.mode != 1) {
                array.splice(this.signIndex, 1);
            }
            sheet.keyArray = array;
        },
        [this.DEFAULT_SIGN.type]: (sheet: ExcelSheet, array: any[]) => {
            if (this.mode != 1) {
                array.splice(this.signIndex, 1);
            }
            sheet.typeArray = array;
        },
        [this.DEFAULT_SIGN.data]: (sheet: ExcelSheet, array: any[]) => {
            if (this.mode != 1) {
                array.splice(this.signIndex, 1);
            }
            sheet.dataArray.push(array);
        },
        [this.DEFAULT_SIGN.default]: this.defaultSignCall,
        [this.DEFAULT_SIGN.isTranspose]: this.defaultSignCall
    }

    /**默认标记行，设置后，无需再表格中添加标记 */
    public defaultSignLine = {
    }

    /**模式0：标记模式  1：无标记模式（次模式下需要配置defaultSignLine） */
    public mode: number = 0;

    public dataSetterParse = (dataObject: any, keyStr: string, data: any, i: number) => {
        dataObject[keyStr] = data;
    }

    public dataLineSetterParse = (sheet: ExcelSheet, dataObject: any) => {
        sheet.jsonObject.push(dataObject);
    }

    public getSheetObject = (sheet: ExcelSheet) => {
        if (sheet.mainKey != null) {
            let obj = {};
            for (let data of sheet.jsonObject) {
                obj[data[sheet.mainKey]] = data;
            }
            return obj;
        } else {
            return sheet.jsonObject;
        }
    }
}