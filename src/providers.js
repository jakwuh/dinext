import {ClassProviderLabel, FactoryProviderLabel, PrimaryDefinition} from './index';
import {hasAnnotation, isUpperCase} from './utils';

export function isClassProvider(definition: PrimaryDefinition): boolean {
    if (hasAnnotation(definition, ClassProviderLabel)) {
        return true;
    } else if (hasAnnotation(definition, FactoryProviderLabel)) {
        return false;
    } else if (definition.provider.name) {
        return isUpperCase(definition.provider.name.charAt(0))
    } else {
        return Reflect.ownKeys(definition.provider.prototype).length > 0;
    }
}

export function createClassProvider(Class) {
    return (dependencies) => {
        return new Class(dependencies);
    }
}

export function createFactoryProvider(Factory) {
    return (dependencies) => {
        return Factory(dependencies);
    }
}

export function createProvider(definition : PrimaryDefinition) {
    if (isClassProvider(definition)) {
        return createClassProvider(definition.provider);
    } else {
        return createFactoryProvider(definition.provider);
    }
}
