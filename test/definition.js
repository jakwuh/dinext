import {expect} from 'chai';
import {Definition, createContainer, FactoryProviderLabel, ClassProviderLabel} from '../src/index';
import {isClassProvider} from '../src/providers';
import {Bar, Foo} from './fixtures';

describe('Definition', function () {
    let container;

    beforeEach(function () {
        container = createContainer();
    });

    afterEach(function () {
        container = null;
    });

    describe('provider', function () {
        it('supports function', function () {
            let definition = new Definition({
                provider: Foo.factory
            });

            let instance = container.get(definition);
            expect(instance).to.be.instanceof(Foo);
        });

        it('supports class', function () {
            let definition = new Definition({
                provider: Foo
            });

            let instance = container.get(definition);
            expect(instance).to.be.instanceof(Foo);
        });

        it('supports forcing function', function () {
            let definition = new Definition({
                provider: Foo,
                annotations: [new FactoryProviderLabel]
            });

            expect(isClassProvider(definition)).to.be.false;
        });

        it('supports forcing class', function () {
            let definition = new Definition({
                provider: Foo.factory,
                annotations: [new ClassProviderLabel()]
            });

            expect(isClassProvider(definition)).to.be.true;
        })
    });

    describe('updateMethod', function () {
        it('supports function', function () {
            let foo, definition = new Definition({
                provider: Foo,
                updateMethod() {foo = this},
                dependencies: {
                    bar: Bar
                }
            });

            let instance = container.get(definition);

            expect(instance).to.be.instanceof(Foo).to.eql(foo);
        });

        it('supports string', function () {
            let definition = new Definition({
                provider: Foo,
                updateMethod: 'update'
            });

            let instance = container.get(definition);

            expect(instance).to.be.instanceof(Foo);
            expect(instance).to.have.property('updateWasCalled').that.is.eql(true);
        });
    });

    describe('dependencies', function () {
        it('supports function and class', function () {
            let definition = new Definition({
                provider: Foo,
                dependencies: {
                    bar: Bar,
                    foo: Foo.factory
                }
            });

            let instance = container.get(definition);

            expect(instance).to.be.instanceof(Foo);
            expect(instance).to.have.property('bar').that.is.instanceof(Bar);
            expect(instance).to.have.property('foo').that.is.instanceof(Foo);
        });

        it('supports definition', function () {
            let definition = new Definition({
                provider: Foo,
                dependencies: {
                    bar: new Definition(Bar),
                    foo: new Definition(new Definition(Foo))
                }
            });

            let instance = container.get(definition);

            expect(instance).to.be.instanceof(Foo);
            expect(instance).to.have.property('bar').that.is.instanceof(Bar);
            expect(instance).to.have.property('foo').that.is.instanceof(Foo);
        });
    });

});
