const mongoose = require('mongoose')

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI , {
        dbName : "Jobfair"
    })

    console.log("MongoDB Connected : " + conn.connection.host)
}

module.exports = connectDB