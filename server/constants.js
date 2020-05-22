const errCodes = {
    invalidInput: '1000',
    missingImage: '1001',
    wrongType: '1002',
    otherErr: '1003'
}

const firebaseConn = {
    seniorsCollection: 'seniors',
    filterCollection: 'filters',
    blacklistDoc: 'blacklist'
}

const cache = {
    ttl: 24 * 60 * 60, // 24 hour cache
    cacheKey: 'seniors',
    blacklistKey: 'blacklist'
}

module.exports = { firebaseConn: firebaseConn, errCodes: errCodes, cache: cache }