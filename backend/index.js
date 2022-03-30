const express = require('express')
const cors = require('cors')
const UserRoutes = require('./routes/UserRoutes')
const PetRoutes = require('./routes/PetRoutes')
const bodyParser = require('body-parser')

const app = express()

// Config json response
app.use(bodyParser.json())

//Solve CORS
app.use(cors({credentials: true, origin: 'http://localhost:3000'}))

// Public folders for images
app.use(express.static('public'))

// Routes
app.use('/users', UserRoutes)
app.use('/pets', PetRoutes)


app.listen(5000)