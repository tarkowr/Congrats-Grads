module.exports = {
    logMessage(label, data = '') {
        console.log(label, data)
    },

    logWarning(message, warning) {
        console.warn(message, warning)
    },

    logError(message, error) {
        console.error(message, error)
    }
}