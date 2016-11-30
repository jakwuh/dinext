// @flow
// todo should we call updateDependencies for the first time?

import {isFunction, isString, isObject, zipObject, all, then, hasAnnotation} from './utils';
import {createProvider} from './providers';

declare type Instance = Object;
declare type Token = Definition | Function;
declare type Provider = Definition | Function;
declare type UpdateMethod = Function | string;
declare type DependenciesDescriptor = {[name: string]: Token};
declare type Dependencies = {[name: string]: Instance};
declare type Annotation = typeof FactoryProviderLabel | typeof ClassProviderLabel;
declare type Annotations = Array<Annotation>;
declare type PrimaryDefinition = Definition & {provider: Function};

export class Definition {
    provider: Provider;
    updateMethod: UpdateMethod;
    dependencies: DependenciesDescriptor;
    annotations: Annotations;

    constructor(providerOrDescriptor: Provider | Object,
                updateMethod?: UpdateMethod,
                dependenciesOrAnnotations ?: DependenciesDescriptor | Annotations = {},
                annotations ?: Annotations = []) {
        let provider = providerOrDescriptor;
        let dependencies;

        // todo up updateMethod from provider chain
        // todo collect dependencies, annotations from provider chain

        if (!isFunction(providerOrDescriptor)) {
            let descriptor = providerOrDescriptor;
            provider = descriptor.provider;
            updateMethod = descriptor.updateMethod;
            dependencies = descriptor.dependencies || {};
            annotations = descriptor.annotations || [];
        } else if (Array.isArray(dependenciesOrAnnotations)) {
            dependencies = {};
            annotations = dependenciesOrAnnotations;
        } else {
            dependencies = dependenciesOrAnnotations;
        }

        Object.assign(this, {provider, updateMethod, dependencies, annotations});
    }

}

export class FactoryProviderLabel {
}

export class ClassProviderLabel {
}

export class TransientLabel {
}

class Container {
    parent: Container | void;
    instances: Map<Token, Instance>;
    providers: Map<Definition, Function>;
    definitions: Map<Token, Definition>;

    constructor({parent} : {parent:? Container} = {}) {
        this.parent = parent;
        this.instances = new Map();
        this.providers = new Map();
        this.definitions = new Map();
    }

    normalizeToken(token: Token): Definition {
        // todo parent definitions
        if (this.definitions.has(token)) {
            return this.definitions.get(token);
        } else if (token instanceof Definition) {
            return token;
        } else {
            let definition = new Definition(token);
            this.definitions.set(token, definition);
            return definition;
        }
    }

    loadDependencies(dependencies: DependenciesDescriptor): Dependencies | Promise<Dependencies> {
        let names = [], instances = [];

        for (let [name, token] of Object.entries(dependencies)) {
            names.push(name);
            instances.push(this.get(token));
        }

        return all(instances, (instances) => {
            return zipObject(names, instances);
        });
    }

    getProvider(definition: Definition): Function {
        if (this.providers.has(definition)) {
            return this.providers.get(definition);
        } else {
            let primaryDefinition = definition;
            while (primaryDefinition.provider instanceof Definition) {
                primaryDefinition = primaryDefinition.provider;
            }
            if (typeof primaryDefinition.provider !== 'function') {
                throw new Error(`Expected provider to be a class or a function`);
            }
            let provider = createProvider(primaryDefinition);
            this.providers.set(definition, provider);
            return provider;
        }
    }

    getFromCache(definition: Definition): Instance | void {
        if (this.instances.has(definition)) {
            return this.instances.get(definition);
        } else if (this.parent) {
            return this.parent.getFromCache(definition);
        }
    }

    get(token: Token): Promise<Instance> | Instance {
        let instance, definition = this.normalizeToken(token);

        if (this.instances.has(definition)) {
            return this.instances.get(definition);
        } else if (instance = this.getFromCache(definition)) {
            let instance = this.updateInstance(instance, definition);
            this.maybeCacheInstance(instance, definition);
            return instance;
        } else {
            let promiseOrInstance = this.createInstance(definition, this.getProvider(definition));
            this.maybeCacheInstance(promiseOrInstance, definition);
            return promiseOrInstance;
        }
    }

    maybeCacheInstance(instance, definition) {
        if (!hasAnnotation(definition, TransientLabel)) {
            this.instances.set(definition, instance);
        }
    }

    createInstance(definition: Definition, provider: Function): Promise<Instance> | Instance {
        return then(this.loadDependencies(definition.dependencies), (dependencies) => {
            let instance = provider(dependencies);
            this.maybeCacheInstance(instance, definition);
            return this.updateInstanceDependencies(instance, definition, dependencies);
        });
    }

    updateInstance(instance: Instance, definition: Definition): Promise<Instance> | Instance {
        return then(this.loadDependencies(definition.dependencies), (dependencies) => {
            return this.updateInstanceDependencies(instance, definition, dependencies);
        });
    }

    updateInstanceDependencies(instance, definition, dependencies): Instance {
        let updateMethod = definition.updateMethod || 'updateDependencies';
        if (isString(updateMethod) && isObject(instance)) {
            updateMethod = instance[updateMethod];
        }
        if (isFunction(updateMethod)) {
            updateMethod.call(instance, dependencies);
        }
        return instance;
    }

    // todo should we pass definitions / providers?
    createSession() {
        return new Container({
            parent: this
        });
    }

    closeSession() {
        this.parent = undefined;
    }

}

export function createContainer() {
    return new Container();
}
