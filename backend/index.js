const express=require("express")
const cors=require('cors')
const helmet=require('helmet')
require('dotenv').config()
const userRoutes=require('./Routes/userRoutes')
const connectDB = require("./DB/db")
const app=express()
connectDB()
app.use(cors())
app.use(express.json())
app.use(helmet())

app.get('/',(req,res)=>{
    res.status(200).json({
        success : true,
        message : "This is the home page"
    })
})
app.use('/api/user',userRoutes)

app.listen(process.env.PORT,()=>console.log("App is listening on port "+process.env.PORT))



