const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
const { compress } = require("compress-images/promise")
const admin = require('firebase-admin')
const NodeCache = require('node-cache')
const config = require('../.env/config.json')
const serviceAccount = require('../.env/congratsgrads-firebase-adminsdk-x83rw-55675f8283.json')
const constants = require('./constants')
const logger = require('./logger')

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
const seniorCacheKey = constants.cache.seniorCacheKey

module.exports = class Controller {

    // Empty the uploads folder
    removeUploads() {
        const dirs = ['uploads', 'compressed-uploads']

        dirs.forEach((dir) => {
            fs.readdir(dir, (err, files) => {
                if (err) return
            
                for (const file of files) {
                    if (file == 'initialize.txt') return
                    fs.unlink(path.join(dir, file), err => {
                        if (err) return
                        logger.logMessage('Removed uploaded file')
                    })
                }
            })
        })
    }

    // Remove uploaded file on server
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

    // Retrieve all senior profiles from firebase
    fetchAllSeniors(admin=false) {
        const orderField = 'uploaded'
        return db.collection(constants.firebaseConn.seniorsCollection).orderBy(orderField, 'desc').get()
        .then((snapshot) => {
            let seniors = []

            snapshot.forEach(doc => seniors.push(doc.data()))

            if (!admin) {
                seniors.forEach(senior => this.hideIP(senior))
            }

            this.cacheSet(seniorCacheKey, seniors, ttl)
            return seniors
        })
    }

    // Compress uploaded profile pictures
    compressProfileImage(path, output) {
       return compress({
            source: path,
            destination: output,
            enginesSetup: {
                jpg: { engine: 'mozjpeg', command: ['-quality', '60']},
                png: { engine: 'pngquant', command: ['--quality=20-50', '-o']},
            }
        }).then(results => {
            const { statistics, errors } = results
            return !(errors && errors.length > 0)
        })
    }

    // Upload profile image to firebase storage
    uploadProfileImage(path) {
        return storage.upload(path, {
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
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
        let cachedResults = this.cacheGet(seniorCacheKey)

        if (cachedResults){
            senior['uploaded'] = { _seconds: this.calcTimestamp(senior['uploaded']), _nanoseconds:0 }
			this.hideIP(senior)
            cachedResults.push(senior)
            this.cacheSet(seniorCacheKey, cachedResults)
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
        try {
            client.sendMail(mailOptions, (error, info) => {
                if (error) {
                    onError(error)
                } else {
                    onSuccess(info)
                }
            })
        }
        catch (err) {
            onError(err)
        }
    }

    // Helper to download all senior data and save to JSON file
    async downloadSeniors() {
        let seniors = await this.fetchAllSeniors(true)
        let json = JSON.stringify(seniors)
        fs.writeFile('senior-backup.json', json, 'utf8', () => {})

        logger.logMessage(`Downloaded ${seniors.length} senior profiles`)
    }

    // Helper to download profile pictures in firebase for backup
    async downloadProfilePictures() {
        let res = await storage.getFiles()

        logger.logMessage(`Fetched ${res[0].length} profile pictures`)

        res[0].forEach(async (image) => { 
            await image.download({destination: `downloads/${image.name}`})
            logger.logMessage(`Downloaded ${image.name}`)
        })
    }

    // Helper to compress all downloaded profile pictures
    async compressDownloadedProfilePictures() {
        const dir = await fs.promises.opendir('downloads')
        for await (const image of dir) {
            await this.compressProfileImage(`downloads/${image.name}`, 'compressed/', image.name)
            logger.logMessage(`Compressed ${image.name}`)
        }
    }   
    
    // Helper to delete select files in storage and reupload the compressed version
    async uploadCompressedProfilePictures() {
        let counter = 0
        let res = await storage.getFiles()

        const dir = await fs.promises.opendir('compressed')
        for await (const image of dir) {
            await res[0].find(i => i.name == image.name).delete()
            await this.uploadProfileImage(`compressed/${image.name}`)
            counter = counter + 1
        }

        logger.logMessage(`Uploaded ${counter} profile pictures`)
    }
}