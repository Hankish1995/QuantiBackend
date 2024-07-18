let mongoose = require('mongoose')
let express = require('express')
let app = express()
let v1Route = require('./src/routes/v1Routes')
let cors = require('cors')
let fileUpload= require('express-fileupload')
require('dotenv').config();
let db = require('./src/config/dbConfig')



app.use(cors())
app.use(cors({
    origin: '*'
}))
app.use(express.text())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())

app.use('/api/v1/', v1Route)

mongoose.set('strictQuery', false);
mongoose.connect(db.url);


app.listen(process.env.PORT, () => console.log('backend is running...'))