const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
const admin = require('firebase-admin')
const NodeCache = require('node-cache')
const config = require('../.env/config.json')
const serviceAccount = require('../.env/congratsgrads-firebase-adminsdk-x83rw-55675f8283.json')
const constants = require('./constants')

// Connect to Firebase and Firebase Storage
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://congratsgrads.firebaseio.com',
    storageBucket: 'congratsgrads.appspot.com'
})

// Initialize firebase services
let db = admin.firestore()
let storage = admin.storage().bucket()

// Setup cache
let cache = new NodeCache()
const ttl = constants.cache.ttl
const cacheKey = constants.cache.cacheKey
const blacklistKey = constants.cache.blacklistKey

module.exports = class Controller{

    // Empty the uploads folder
    removeUploads() {
        const dir = 'uploads'

        fs.readdir(dir, (err, files) => {
            if (err) return
        
            for (const file of files) {
				if (file == 'initialize.txt') return
                fs.unlink(path.join(dir, file), err => {
                    if (err) return
                    console.log('Removed uploaded file')
                })
            }
        })
    }

    // Remove uploaded file
    removeUpload(path) {
        fs.unlink(path, (err) => {
            if (err) return
        })
    }

    // Retrieve item in cache
    cacheGet(key) {
        return cache.get(key)
    }

    // Set item in cache
    cacheSet(key, value, ttl) {
        cache.set(key, value, ttl)
    }

    // Remove item from cache
    cacheDel(key) {
        cache.del(key)
    }

    // Retrieve blacklist from firebase
    fetchBlacklist() {
        return db.collection(constants.firebaseConn.filterCollection).doc(constants.firebaseConn.blacklistDoc).get()
            .then(doc => {
                let ips = doc.data().ip
                this.cacheSet(blacklistKey, ips, 0)
                return ips
            })
    }

    // Retrieve all senior profiles from firebase
    fetchAllSeniors(isAdmin) {
        const orderField = 'uploaded'
        return db.collection(constants.firebaseConn.seniorsCollection).orderBy(orderField, 'desc').get()
        .then((snapshot) => {
            let seniors = []

            snapshot.forEach(doc => seniors.push(doc.data()))

            if (!isAdmin) {
                seniors.forEach(senior => this.hideIP(senior))
            }

            this.cacheSet(cacheKey, seniors, ttl)
            return seniors
        })
    }

    // Upload profile image to firebase storage
    uploadProfileImage(path) {
        return storage.upload(path, {
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
        }).then(() => {
            this.removeUpload(path)
        })
    }

    // Insert senior profile into firebase
    insertSenior(id, senior) {
        return db.collection(constants.firebaseConn.seniorsCollection).doc(id).set(senior)
            .then(() => {
                this.updateSeniorCache(senior)
            })
    }

    // Update the cache upon senior upload
    updateSeniorCache(senior) {
        let cachedResults = this.cacheGet(cacheKey)

        if (cachedResults){
            senior['uploaded'] = { _seconds: this.calcTimestamp(senior['uploaded']), _nanoseconds:0 }
			this.hideIP(senior)
            cachedResults.push(senior)
            this.cacheSet(cacheKey, cachedResults)
        }
    }
	
	// Remove IP from senior obj
    hideIP(senior) {
        delete senior['ip']
    }

    // Get timestamp from a date
    calcTimestamp(date) {
        return Math.floor(date.getTime()/1000)
    }

    // Send Email using Gmail Client
    sendEmail(sender, receiver, subject, message, onSuccess, onError) {
        let client = undefined
    
        // Connect to email client
        try {
            client = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                requireTLS: false,
                auth: {
                    user: config.email,
                    pass: config.password
                }
            })
        }
        catch (err) {
            onError(err)
            return
        }
    
        const mailOptions = {
            from: sender + ' <' + config.email + '>',
            to: receiver,
            subject: subject,
            text: message
        }
    
        // Send email
        client.sendMail(mailOptions, (error, info) => {
            if (error){
                onError(err)
            } else {
                onSuccess()
            }
        })
    }
}