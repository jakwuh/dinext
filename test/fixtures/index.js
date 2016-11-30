export class Bar {

}

export class Foo {
    constructor(data) {
        Object.assign(this, data);
    }

    update() {
        this.updateWasCalled = true;
    }

    static factory(data) {
        return new Foo(data);
    }

    static promiseFactory(data) {
        return new Promise(resolve => {
            setTimeout(() => resolve(new Foo(data)), 10);
        });
    }
}

export function assignDependencies(deps) {
    Object.assign(this, deps);
}
