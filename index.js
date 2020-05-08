const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
let app = express()
const cookieParser = require('cookie-parser')
const _ = require('underscore')
const uuid = require('uuid')

let admin = require('firebase-admin')
let serviceAccount = require('./.env/congratsgrads-firebase-adminsdk-x83rw-55675f8283.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://congratsgrads.firebaseio.com',
    storageBucket: 'congratsgrads.appspot.com'
});

let db = admin.firestore()
let storage = admin.storage().bucket()

const seniorsCollection = 'seniors'

app.use(bodyParser.urlencoded({  
    extended: true,
    keepExtensions: true  
}))

app.use(bodyParser.json())
app.use(cookieParser())

app.use(express.static(__dirname + '/dist'))
app.use(cors())

// Create new senior profile
app.post('/create', (req, res) => {
    let fname = req.body.fname
    let lname = req.body.lname
    let school = req.body.highSchool
    let comments = req.body.comments

    const nameRegex = /^[a-zA-Z0-9 ]{1,20}$/
    const schoolRegex = /^[a-zA-Z0-9 ]{1,40}$/
    const commentRegex = /^.{1,500}$/

    // Validate input
    if (!nameRegex.test(fname) || !nameRegex.test(lname) || !schoolRegex.test(school) || !commentRegex.test(comments)) {
        res.status(500).send('Invalid input')
        return
    }

    const id = uuid.v4()
    const uploaded = new Date()

    const senior = {
        fname: fname,
        lname: lname,
        school: school,
        comments: comments,
        id: id,
        uploaded: uploaded
    }


    // Add senior to firebase
    db.collection(seniorsCollection).doc(id).set(senior)
        .then(() => {
            res.status(200).json(senior)
        }).catch(err => {
            res.status(500).send(err)
        })
})

const PORT = process.env.PORT || 3200
app.listen(PORT, function(){
    console.log(`Listening on port ${PORT}`)
    /*storage.getFiles().then((response) => {
        let ref = response[0]
        ref.forEach((file) => {
            console.log(file.metadata)
        })
    }).catch(err => {
        console.log(err)
    })*/
})