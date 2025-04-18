

export default class<V> {

    private keyToIndex: Record<string, number> = {};
    private values: V[] = [];

    constructor() {};

    searchValue(key: string | number): V | undefined {
        return this.values[this.keyToIndex[key]];
    }

    set(keys: Array<string | number>, value: V) {
        let valueIndex = this.values.length;

        for(let index = 0; index < keys.length; index++) {
            this.keyToIndex[keys[index]] = valueIndex;
            this.values[valueIndex] = value;
        }
    }

    getValues() {
        return this.values;
    }
}