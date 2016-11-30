import type {Annotations, Annotation} from './index';

export function isString(O) {
    return typeof O === 'string';
}

export function isObject(O) {
    return typeof O === 'object';
}

export function isPromise(O) {
    return isObject(O) && isFunction(O.then);
}

export function isFunction(O) {
    return typeof O === 'function';
}

export function isUpperCase(string : string) : boolean {
    return string === string.toUpperCase();
}

export function hasAnnotation(
    object : {annotations ?: Annotations},
    annotation : Annotation) : boolean
{
    if (!Array.isArray(object.annotations)) {
        return false;
    }
    return object.annotations.some(current => current instanceof annotation);
}

export function all(values : Array, resolve ?: Function, reject :? Function) {
    if (values.some(isPromise)) {
        return Promise.all(values).then(resolve, reject);
    } else {
        try {
            return resolve ? resolve(values) : Promise.resolve(values);
        } catch (error) {
            return reject ? reject(error) : Promise.reject(error);
        }
    }
}

export function then(value, resolve ?: Function, reject :? Function) {
    if (isPromise(value)) {
        return value.then(resolve, reject);
    } else {
        try {
            return resolve ? resolve(value) : Promise.resolve(value);
        } catch (error) {
            return reject ? reject(error) : Promise.reject(error);
        }
    }
}

export function zipObject(keys : Array<string | Symbol>, values : Array) {
    return keys.reduce((memo, current, index) => {
        memo[current] = values[index];
        return memo;
    }, {});
}
