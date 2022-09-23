export class Tbl<T>{
    private sourceData: any = null;
    constructor(sourceData: any) {
        this.sourceData = sourceData;
    }

    public get(...key: string[] | number[]): T | null {
        let keys = [...key];
        let keyStr = keys.join('_')
        let index = this.sourceData.index[keyStr];
        if (index == null) {
            return null;
        }

        let data = this.weapData(index);
        if (data == null) {
            return null;
        }

        return JSON.parse(JSON.stringify(data)) as T;
    }

    public getDataList(): T[] {
        let array: any = [];
        for (let i = 0, len = this.sourceData.data.length; i < len; i++) {
            let data = this.weapData(i);
            array.push(data);
        }
        return JSON.parse(JSON.stringify(array)) as T[]
    }

    public get length(): number {
        return this.sourceData.data.length;
    }

    private weapData(index: number): Object | null {
        let data = this.sourceData.data[index];
        if (data == null) {
            return null;
        }
        let obj = {};
        let keys = this.sourceData.keys;
        for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i]
            obj[key] = data[i]
        }
        return data;
    }
}