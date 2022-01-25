export module excelconvert {
    export let XLSX: any;

    export let convert: (data, fileName) => any;

    export let convertToTs: (fileName, jsonObj) => string;

    export let setDefaultTypeValue: (type, value) => void;

    export let getDefaultTypeValue: (type) => void;

    export let addCustomTypeParse: (type, func) => void;

    export let setCustomConvert: (fuc) => void;

    export let arrayToObject: (dataArray, key) => any;
} 