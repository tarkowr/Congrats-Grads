const Filter = require('bad-words')
const constants = require('./constants')

module.exports = class Validation {

    filter = new Filter()

    validateEmail(sender, message) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/
        const messageRegex = /^.{1,1000}$/
    
        if (!emailRegex.test(sender) || !messageRegex.test(message)){
            return false
        }
    
        return true
    }

    validateProfile(fname, lname, school, comments, profile) {
        const nameRegex = /^[.a-zA-Z0-9 \-]{1,20}$/
        const schoolRegex = /^[.a-zA-Z0-9 \-]{1,40}$/
        const commentRegex = /^.{1,500}$/
        const fileTypeRegex = /^(image\/)[a-z\-]{1,10}$/
        const fileRegex = /^[a-zA-Z0-9\-]{30,39}[.](jpe?g|png|JPE?G|PNG)$/
    
        // Validate text input
        if (!nameRegex.test(fname) || !nameRegex.test(lname) || !schoolRegex.test(school) || !commentRegex.test(comments)) {
            return constants.errCodes.invalidInput
        }
    
        // Check if uploaded file exists
        if (!profile) {
            return constants.errCodes.missingImage
        }
    
        // Validate profile image type
        if (!fileTypeRegex.test(profile.mimetype.toLowerCase()) || !fileRegex.test(profile.filename)) {
            return constants.errCodes.wrongType
        }

        let fnameBackup = fname
        let lnameBackup = lname
        let schoolBackup = school
        let commentsBackup = comments
    
        // Filter input
        fname = this.filter.clean(fname)
        lname = this.filter.clean(lname)
        school = this.filter.clean(school)
        comments = this.filter.clean(comments)
    
        if (fname != fnameBackup || lname != lnameBackup || school != schoolBackup || comments != commentsBackup) {
            return constants.errCodes.otherErr
        }

        return null
    }
}