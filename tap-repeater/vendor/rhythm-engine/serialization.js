function sortValue(value) {
    if (Array.isArray(value)) {
        return value.map(sortValue);
    }

    if (value && typeof value === 'object') {
        return Object.keys(value)
            .sort()
            .reduce((result, key) => {
                result[key] = sortValue(value[key]);
                return result;
            }, {});
    }

    return value;
}

function encodeBase64Url(text) {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(text, 'utf8')
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');
    }

    return btoa(text)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function decodeBase64Url(value) {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(padded, 'base64').toString('utf8');
    }
    return atob(padded);
}

export function serializePattern(pattern) {
    const canonical = JSON.stringify(sortValue(pattern));
    return encodeBase64Url(canonical);
}

export function parsePattern(serialized) {
    if (serialized && typeof serialized === 'object') {
        return serialized;
    }

    if (typeof serialized !== 'string' || !serialized.trim()) {
        throw new Error('Serialized rhythm pattern must be a non-empty string.');
    }

    const trimmed = serialized.trim();

    try {
        return JSON.parse(trimmed);
    } catch (_error) {
        const decoded = decodeBase64Url(trimmed);
        return JSON.parse(decoded);
    }
}
