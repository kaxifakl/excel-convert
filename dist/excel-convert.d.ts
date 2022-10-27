declare class ExcelSheet {
    /**工作簿名字 */
    name: string;
    /**配置 */
    excelConfig: ExcelConfig;
    /**源数据 */
    sourceData: any[];
    /**主键 */
    mainKey: string;
    /**键 */
    keyArray: string[];
    /**类型 */
    typeArray: string[];
    /**值 */
    dataArray: any[];
    mainKeyIndex: number;
    jsonObject: any;
    bookName: string;
    constructor(name: string, sourceData: any, excelConfig: ExcelConfig, bookName: string);
    private parse;
    private parseData;
    getJsonObject(): any;
}

declare class ExcelConfig {
    /**内置标记 */
    DEFAULT_SIGN: {
        /**是否转置 */
        isTranspose: string;
        /**键 */
        key: string;
        /**类型 */
        type: string;
        /**注释 */
        annotation: string;
        /**数据 */
        data: string;
        /**默认 */
        default: string;
    };
    DEFAULT_TAG: {
        /**主键 */
        mainKey: string;
    };
    reg: string[];
    /**标记索引位置 */
    signIndex: number;
    defaultTypeValue: {
        number: number;
        string: string;
        boolean: boolean;
        "number[]": any[];
        "string[]": any[];
        "boolean[]": any[];
        object: any;
    };
    defaultTypeParse: {
        number: (value: string) => number;
        string: (value: string) => string;
        boolean: (value: string) => boolean;
        "number[]": (value: string) => any[];
        "string[]": (value: string) => string[];
        "boolean[]": (value: string) => any[];
        object: (value: string) => any;
    };
    private defaultSignCall;
    defaultSignParse: {
        [x: string]: (sheet: ExcelSheet, array: any[]) => void;
    };
    /**默认标记行，设置后，无需再表格中添加标记 */
    defaultSignLine: {};
    /**模式0：标记模式  1：无标记模式（次模式下需要配置defaultSignLine） */
    mode: number;
    dataSetterParse: (dataObject: any, keyStr: string, data: any, i: number) => void;
    dataLineSetterParse: (sheet: ExcelSheet, dataObject: any) => void;
    getSheetObject: (sheet: ExcelSheet) => any;
}

declare class ExcelBook {
    /**配置 */
    excelConfig: ExcelConfig;
    /**表格名字 */
    name: string;
    /**工作簿 */
    sheets: ExcelSheet[];
    constructor(excelConfig: ExcelConfig);
    /**获取表格json对象 */
    getJsonObject(): any;
}

declare class ExcelConvert {
    private static _default;
    static get default(): ExcelConvert;
    excelConfig: ExcelConfig;
    parse(data: Uint8Array, fileName: string): ExcelBook;
    /**表格数据格式化 */
    private formatData;
}

export { ExcelBook, ExcelConfig, ExcelConvert, ExcelSheet };
