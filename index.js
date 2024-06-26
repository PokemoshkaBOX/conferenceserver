require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes')
const errorHandler = require('./middleware/ErrorHandlingMiddlware')
const path = require('path')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 5000
const app = express()


app.use(express.json())
app.use(cookieParser())
app.use(cors({
    withCredentials:true,
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(express.static(path.resolve(__dirname, 'controllers','uploads')))
app.use(fileUpload({}))
app.use('/api', router)

app.use(errorHandler)
const start = async()=>{
    try{

        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    }
    catch(e){
        console.log(e)
    }
}

start()