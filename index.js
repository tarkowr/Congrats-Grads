const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const cookieParser = require('cookie-parser')
const _ = require('underscore')
const uuid = require('uuid')
const Validation = require('./server/validation')
const Controller = require('./server/controller')
const constants = require('./server/constants')
const logger = require('./server/logger')

let app = express()

// Instantiate custom services
let validation = new Validation()
let controller = new Controller()

// Multer image upload middleware
let multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, uuid.v4() + extractExtension(file.originalname))
    }
})

// Helper function for multer middleware to extract a file extension
function extractExtension(filename) {
    return filename.substr(filename.lastIndexOf('.'))
}

// Set Multer properties
const maxSize = 3 * 1024 * 1024
let upload = multer({ 
    storage: multerStorage,
    limits: { fileSize: maxSize }
})

// Use middleware
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
    const path = req.file.path

    const ip = req.headers['x-forwarded-for'] || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null)

    let onError = (err) => {
        logger.logWarning('Invalid uploaded profile!', `Error ${err}`)
        controller.removeUpload(path)
        res.status(500).send(err)
    }

    // Input validation
    const err = validation.validateProfile(fname, lname, school, comments, profile)

    if (err) {
        onError(err)
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

    // Upload image and profile
    await controller.uploadProfileImage(path)
        .catch(err => {
            logger.logError('Unable to upload profile image!', err)
            controller.removeUpload(path)
            res.status(500).send(err)
            return
        })

    await controller.insertSenior(id, senior)
        .catch(err => {
            logger.logError('Unable to insert senior into firebase!', err)
            res.status(500).send(err)
            return
        })

    res.status(200).json(senior)
})

// Get users from firebase
app.get('/seniors/get/all', async (req, res) => {
    let cachedResults = controller.cacheGet(constants.cache.seniorCacheKey)

    // Return cached results if available
    if (cachedResults) {
        res.status(200).json(cachedResults)
        return
    }

    // Retrieve seniors from firebase
    let seniors = await controller.fetchAllSeniors()
        .catch(err => {
            logger.logError('Unable to fetch senior library!', err);
            res.status(500).send(err)
            return
        })

    res.status(200).json(seniors)
})

// Send emails to congratsgrads from contact form
app.post('/contact/send', async (req, res) => {
    let sender = req.body.sender
    let message = req.body.message
    const receiver = 'congratsgrads2020@gmail.com'
    const subject = 'Contact Form'

    // Validate email message and sender
    if (!validation.validateEmail(sender, message)){
        res.status(500).send()
        return
    }

    let onSuccess = () => {
        res.status(200).send()
    }

    let onError = (err) => {
        logger.logError('Unable to send email!', err);
        res.status(500).send(err)
    }

    controller.sendEmail(sender, receiver, subject, message, onSuccess, onError)
})

// Redirect any other requests to the site
app.get('*', function(req, res) {
    res.redirect('https://congratsgrads.web.app')
})

const PORT = process.env.PORT || 3200
app.listen(PORT, function() {
    console.log(`Listening on port ${PORT}`)

    // Empty uploads folder
    controller.removeUploads()

    // Store senior profiles in cache
    controller.fetchAllSeniors()
        .then(seniors => {
            logger.logMessage(`Fetched ${seniors.length} seniors`)
        })
        .catch(err => {
            logger.logError('Unable to fetch senior library!', err)
        })
})