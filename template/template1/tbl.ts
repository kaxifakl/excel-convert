export class Tbl<T>{
    private cache: any = {};
    private sourceData: any = null;
    constructor(sourceData: any) {
        this.sourceData = sourceData;
        this.getDataList();
        this.sourceData.data = null;
        this.sourceData.key = null;
    }

    public get(...key: string[] | number[]): T  {
        let keys = [...key];
        let keyStr = keys.join('_')
        let index = this.sourceData.index[keyStr];
        if (index == null) {
            return null as T;
        }

        let data = this.warpData(index);
        if (data == null) {
            return null as T;
        }

        return data as T;
    }

    public getDataList(): T[] {
        let array: any = [];
        for (let i = 0, len = this.sourceData.data.length; i < len; i++) {
            let data = this.warpData(i);
            array.push(data);
        }
        return array;
    }

    public get length(): number {
        return this.sourceData.data.length;
    }

    private warpData(index: number): Object | null {
        if (this.cache[index] != null) {
            return this.cache[index];
        }
        let data = this.sourceData.data[index];
        if (data == null) {
            return null;
        }
        let obj = {};
        let keys = this.sourceData.key;
        for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i]
            obj[key] = data[i]
        }
        deepFreeze(obj);
        this.cache[index] = obj;

        return obj;
    }
}

function deepFreeze(obj) {
    if (typeof obj != 'object') {
        throw Error('Type Error!')
    }
    Object.freeze(obj);
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            if (typeof obj[key] === 'object') {
                deepFreeze(obj[key])
            }
        }
    }
}