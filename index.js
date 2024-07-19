let mongoose = require('mongoose')
let express = require('express')
let app = express()
let v1Route = require('./src/routes/v1Routes')
let cors = require('cors')
let fileUpload= require('express-fileupload')
let config = require('./src/config/dbConfig')



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
mongoose.connect(config.url);


app.listen(config.PORT, () => console.log('backend is running...'))