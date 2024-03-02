const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')

dotenv.config({path : './config/config.env'})

connectDB()

const app = express()
app.use(express.json())

app.use(cookieParser())

//Route
// app.get('/' , (req , res) => {res.status(200).json({msg : "HelloWorld"})})
const auth = require('./routes/auth')
app.use('/api/auth' , auth)

const companies = require('./routes/companies')
app.use('/api/companies' , companies)

const timeslot = require('./routes/timeslot')
app.use('/api/timeslot' , timeslot)

const reservation = require('./routes/reservation')
app.use('/api/reservation',reservation)




const PORT = process.env.PORT
const server = app.listen(PORT , console.log("Server Started in Port : " + PORT))

process.on('unhandledRejection' , (err , promise) => {
    console.log("Error : " + err.message)
    server.close(() => {
        process.exit(1)
    })
})