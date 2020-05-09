const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
let app = express()
const cookieParser = require('cookie-parser')
const _ = require('underscore')
const uuid = require('uuid')
const fs = require('fs')

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

const maxSize = 2 * 1024 * 1024
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

    const nameRegex = /^[a-zA-Z0-9 ]{1,20}$/
    const schoolRegex = /^[a-zA-Z0-9 ]{1,40}$/
    const commentRegex = /^.{1,500}$/
    const fileTypeRegex = /^(image\/)[a-z\-]{1,10}$/
    const fileRegex = /^[a-zA-Z0-9\-]{30,39}[.](jpe?g|tiff|png|webp|bmp)$/

    // Validate input
    if (!nameRegex.test(fname) || !nameRegex.test(lname) || !schoolRegex.test(school) || !commentRegex.test(comments)) {
        res.status(500).send('Invalid input')
        return
    }

    // Validate profile image
    if (!fileTypeRegex.test(profile.mimetype) || !fileRegex.test(profile.filename)) {
        res.status(500).send('Invalid image type')
        return
    }
    
    let fileName = profile.filename
    let url = `https://firebasestorage.googleapis.com/v0/b/congratsgrads.appspot.com/o/${fileName}?alt=media`

    const id = uuid.v4()
    const uploaded = new Date()

    const senior = {
        fname: fname,
        lname: lname,
        school: school,
        comments: comments,
        id: id,
        uploaded: uploaded,
        url: url
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
            res.status(200).json(senior)
        }).catch(err => {
            res.status(500).send(err)
        })
})

// Get user from firebase by ID
app.get('/seniors/get/all', (req, res) => {
    db.collection(seniorsCollection).get()
        .then((snapshot) => {
            let seniors = []

            snapshot.forEach(doc => {
                seniors.push(doc.data())
            })

            res.status(200).json(seniors)
        })
        .catch((err) => {
            res.status(500).send(err)
    })
})

const PORT = process.env.PORT || 3200
app.listen(PORT, function(){
    console.log(`Listening on port ${PORT}`)
})