

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

    delete(identifier: string | number) {
        const valueIndex = this.keyToIndex[identifier];
        if(valueIndex == undefined) return false;

        const keys = Object.keys(this.keyToIndex);

        for(let index = 0; index < keys.length; index++) {
            const key = keys[index]
            const keyValue = this.keyToIndex[key];

            if(keyValue == valueIndex) {
                delete this.keyToIndex[key];
            }
        }

        this.values.splice(valueIndex, 1);
        return true;
    }

    getValues() {
        return this.values;
    }
}