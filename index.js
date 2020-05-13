const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
let app = express()
const cookieParser = require('cookie-parser')
const _ = require('underscore')
const uuid = require('uuid')
const fs = require('fs')
const NodeCache = require('node-cache')
const config = require('./.env/config.json')
const nodemailer = require('nodemailer')

const cache = new NodeCache()
const ttl = 24 * 60 * 60; // 24 hour cache
const cacheKey = 'seniors'

let admin = require('firebase-admin')
let serviceAccount = require('./.env/congratsgrads-firebase-adminsdk-x83rw-55675f8283.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://congratsgrads.firebaseio.com',
    storageBucket: 'congratsgrads.appspot.com'
});

let db = admin.firestore()
let storage = admin.storage().bucket()

let multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, uuid.v4() + extractExtension(file.originalname))
    }
})

const maxSize = 3 * 1024 * 1024
let upload = multer({ 
    storage: multerStorage,
    limits: { fileSize: maxSize }
})

const seniorsCollection = 'seniors'

function extractExtension(filename) {
    return filename.substr(filename.lastIndexOf('.'));
}

app.use(bodyParser.urlencoded({  
    extended: true,
    keepExtensions: true  
}))

app.use(bodyParser.json())
app.use(cookieParser())

app.use(express.static(__dirname + '/dist'))
app.use(cors())

// Create new senior profile
app.post('/create', upload.single('profile'), async (req, res) => {
    let fname = req.body.fname
    let lname = req.body.lname
    let school = req.body.highSchool
    let comments = req.body.comments
    let profile = req.file

    const ip = req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)

    const nameRegex = /^[a-zA-Z0-9 \-]{1,20}$/
    const schoolRegex = /^[a-zA-Z0-9 \-]{1,40}$/
    const commentRegex = /^.{1,500}$/
    const fileTypeRegex = /^(image\/)[a-z\-]{1,10}$/
    const fileRegex = /^[a-zA-Z0-9\-]{30,39}[.](jpe?g|tiff|png|webp|bmp)$/

    // Image upload error codes
    const missingImage = '1001'
    const wrongType = '1002'

    // Validate text input
    if (!nameRegex.test(fname) || !nameRegex.test(lname) || !schoolRegex.test(school) || !commentRegex.test(comments)) {
        res.status(500).send('Invalid input')
        return
    }

    // Check if uploaded file exists
    if (!profile) {
        res.status(500).send(missingImage)
        return
    }

    // Validate profile image type
    if (!fileTypeRegex.test(profile.mimetype) || !fileRegex.test(profile.filename)) {
        res.status(500).send(wrongType)
        return
    }
    
    let fileName = profile.filename
    let url = `https://firebasestorage.googleapis.com/v0/b/congratsgrads.appspot.com/o/${fileName}?alt=media`

    const id = uuid.v4()
    const uploaded = new Date()
    const schoolYear = 2020

    const senior = {
        fname: fname,
        lname: lname,
        school: school,
        comments: comments,
        id: id,
        uploaded: uploaded,
        url: url,
        year: schoolYear,
        ip: ip
    }

    const path = req.file.path

    // Upload profile image to firebase storage
    await storage.upload(path, {
        metadata: {
            cacheControl: 'public, max-age=31536000'
          }
    }).then(() => {
        // Delete file on server
        fs.unlink(path, (err) => {
            if (err) { return }
        })
    }).catch(err => {
        res.status(500).send(err)
    })

    // Add senior to firebase
    db.collection(seniorsCollection).doc(id).set(senior)
        .then(() => {
            let cachedResults = cache.get(cacheKey)

            if (cachedResults){
                cachedResults.push(senior)
                cache.set(cacheKey, cachedResults)
            }

            res.status(200).json(senior)
        }).catch(err => {
            res.status(500).send(err)
        })
})

// Get user from firebase by ID
app.get('/seniors/get/all', (req, res) => {
    let cachedResults = cache.get(cacheKey)

    if (cachedResults) {
        res.status(200).json(cachedResults)
        return
    }

    db.collection(seniorsCollection).get()
        .then((snapshot) => {
            let seniors = []

            snapshot.forEach(doc => {
                let s = doc.data()
                s.ip = undefined
                seniors.push(s)
            })

            cache.set(cacheKey, seniors, ttl)
            res.status(200).json(seniors)
        })
        .catch((err) => {
            res.status(500).send(err)
        })
})

// Send emails to congratsgrads from contact form
app.post('/contact/send', (req, res) => {
    let sender = req.body.sender
    let message = req.body.message

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/
    const messageRegex = /^.{1,1000}$/

    if (!emailRegex.test(sender) || !messageRegex.test(message)){
        res.status(500).send()
        return;
    }

    let client = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: false,
        auth: {
            user: config.email,
            pass: config.password
        }
    })

    const mailOptions = {
        from: sender + ' <' + config.email + '>',
        to: 'congratsgrads2020@gmail.com',
        subject: 'Contact Form',
        text: message
    }

    client.sendMail(mailOptions, (error, info) => {
        if (error){
            res.status(500).send(error)
        } else {
            res.status(200).send()
        }
    })
})

// Redirect any other requests to the site
app.get('*', function(req, res) {
    res.redirect('https://congratsgrads.web.app')
});

const PORT = process.env.PORT || 3200
app.listen(PORT, function(){
    console.log(`Listening on port ${PORT}`)

    db.collection(seniorsCollection).get()
        .then((snapshot) => {
            let seniors = []

            snapshot.forEach(doc => {
                let s = doc.data()
                s.ip = undefined
                seniors.push(s)
            })

            cache.del(cacheKey)
            cache.set(cacheKey, seniors, ttl)
        })
        .catch((err) => {
            console.log(err)
        })
})