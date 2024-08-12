const express= require("express")
const cors=require("cors")
const FlashCardRouter=require("./router/flashcardRouter")
require("dotenv").config()

const app= express()
app.use(cors({
    origin:process.env.ALLOW_URL,
    methods:"*"
}))

const port= process.env.PORT || 3000

app.use(express.json())

app.get("/",(req,res)=>{
    res.json({message:"Api running"})
})

app.use("/api",FlashCardRouter)


app.listen(port,()=>console.log("Running on "+port))