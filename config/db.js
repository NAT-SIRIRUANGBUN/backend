const mongoose = require('mongoose')

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI , {
        dbName : "Jobfair"
    })
    await conn.syncIndexes()
    console.log("MongoDB Connected : " + conn.connection.host)
}

module.exports = connectDB