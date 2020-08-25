const errCodes = {
    invalidInput: '1000',
    missingImage: '1001',
    wrongType: '1002',
    otherErr: '1003'
}

const firebaseConn = {
    seniorsCollection: 'seniors',
}

const cache = {
    ttl: 24 * 60 * 60, // 24 hour cache
    seniorCacheKey: 'seniors',
}

module.exports = { firebaseConn: firebaseConn, errCodes: errCodes, cache: cache }