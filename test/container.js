import {expect} from 'chai';
import {Definition, createContainer, TransientLabel} from '../src/index';
import {Bar, Foo} from './fixtures';

describe('Container', function () {
    let container;

    beforeEach(function () {
        container = createContainer();
    });

    afterEach(function () {
        container = null;
    });

    describe('get', function () {
        it('supports async definitions', async function () {
            let promise = container.get(new Definition({
                provider: Foo.promiseFactory,
                dependencies: {
                    foo: Foo
                }
            }));

            expect(promise).to.be.instanceof(Promise);

            expect(await promise).to.be.instanceof(Foo)
                .to.have.property('foo')
                .that.is.instanceof(Foo);
        });

        it('supports async dependencies', async function () {
            let promise = container.get(new Definition({
                provider: Foo,
                dependencies: {
                    foo: Foo.promiseFactory
                }
            }));

            expect(promise).to.be.instanceof(Promise);

            expect(await promise).to.be.instanceof(Foo)
                .to.have.property('foo')
                .that.is.instanceof(Foo);
        });
    });

    describe('cache', function () {
        it('supports (not)transient definitions', function () {
            let notTransientDefinition = new Definition({
                provider: Foo
            });
            let transientDefinition = new Definition({
                provider: notTransientDefinition,
                annotations: [new TransientLabel]
            });

            let notTransientInstance1 = container.get(notTransientDefinition);
            let notTransientInstance2 = container.get(notTransientDefinition);

            expect(notTransientInstance1).to.equal(notTransientInstance2);

            let transientInstance1 = container.get(transientDefinition);
            let transientInstance2 = container.get(transientDefinition);

            expect(transientInstance1).not.to.equal(transientInstance2);
        });
    });

    describe('session', function () {
        it('stores needed / destroy unused instances', function () {
            let tokenA = new Definition(Foo);
            let tokenB = new Definition(Bar);
            let tokenC = new Definition(Foo.factory);
            let tokenD = new Definition(Bar);

            container.get(tokenA);
            container.get(tokenB);
            container.get(tokenC);
            container.get(tokenD);

            let nextContainer = container.createSession();

            nextContainer.get(tokenA);
            nextContainer.get(tokenC);

            nextContainer.closeSession();

            expect(nextContainer.instances.has(tokenA)).to.be.true;
            expect(nextContainer.instances.has(tokenB)).to.be.false;
            expect(nextContainer.instances.has(tokenC)).to.be.true;
            expect(nextContainer.instances.has(tokenD)).to.be.false;
        })
    });

});
