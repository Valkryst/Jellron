/**
 * Determines whether a given object is null or undefined.
 *
 * @param {object} object Object to check.
 * @throws {Error} Thrown if the object is null or undefined.
 */
export function validateDefined(object) {
    if (object == null) {
        throw new Error('Parameter "object" cannot be null or undefined. ' + object)
    }
}

/**
 * Determines whether a given object is a number.
 *
 * @param {object} object Object to check.
 * @throws {Error} Thrown if the object is not a number.
 */
export function validateNumber(object) {
    validateDefined(object);

    if (typeof object !== 'number') {
        throw new Error('Parameter "object" must be a number. ' + object);
    }
}

/**
 * Determines whether a given object is a positive number.
 *
 * @param {object} object Object to check.
 * @throws {Error} Thrown if the object is not a positive number.
 */
export function validatePositiveNumber(object) {
    validateNumber(object);

    if (object <= 0) {
        throw new Error('Parameter "object" must be a non-zero number. ' + object);
    }
}

/**
 * Determines whether a given object is a string.
 *
 * @param {object} object Object to check.
 * @throws {Error} Thrown if the object is not a string.
 */
export function validateString(object) {
    validateDefined(object);

    if (typeof object !== 'string') {
        throw new Error('Parameter "object" must be a string. ' + object);
    }
}

/**
 * Determines whether a given object is a non-empty string.
 *
 * This removes all whitespace from the string before checking its length.
 *
 * @param {object} object Object to check.
 * @throws {Error} Thrown if the object is not a non-empty string.
 */
export function validateNonEmptyString(object) {
    validateString(object);

    if (object.replace(/\s/g, '').length === 0) {
        throw new Error('Parameter "object" must be a non-empty string. ' + object);
    }
}

/**
 * Determines whether a given object is of a given type.
 *
 * @param {object} object Object to check.
 * @param {object} expectedType Expected type of the object
 * @throws {Error} Thrown if the object is not of the expected type.
 */
export function validateInstanceOf(object, expectedType) {
    validateDefined(object);
    validateDefined(expectedType);

    if (!(object instanceof expectedType)) {
        throw new Error(`Parameter "object" must be an instance of ${expectedType.name}. ${object}`);
    }
}