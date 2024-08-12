const Router= require("express")
const connection = require("../utils/database")

const router= Router()
router.post("/flashcard",async(req,res)=>{
    try {
        const {question , answer}=req.body
        connection.query("INSERT INTO flashcards (question,answer) VALUES (?,?)",[question,answer],(err,result)=>{
            if(err){
                console.log("Error occured while uploading flashcard ",err.message)
                return res.json({message:"Flashcard creation failed.",success:false})
            }else{
                console.log("Flash card uplaoded")
                return res.json({message:"Flashcard created.",id:result.insertId,success:true})
            }
        })
    } catch (error) {
        console.log("Error occured: ",error.message)
        return res.json({message:"Internal error occured.",success:false})
    }
})

router.get("/flashcard",(req,res)=>{
    try {
        connection.query("SELECT * FROM flashcards",(err,result)=>{
            if(err){
                console.log("Error occured while fetching flashcard ",err.message)
                return res.json({message:"Fetching flashcard failed.",success:false})
            }else{
                console.log(result)
                return res.json({message:"Flashcard created.",flashcards:result,success:true})
            }
        })

    } catch (error) {
        console.log("Error occured: ",error.message)
        return res.json({message:"Internal error occured.",success:false})
    }
})

router.delete("/flashcard/:id",(req,res)=>{
    try {
        const {id}=req.params
        connection.query("DELETE FROM flashcards WHERE id=?",[id],(err,result)=>{
            if(err){
                console.log("Error occured while deleting flashcard ",err.message)
                return res.json({message:"Deletion of flashcard failed.",success:false})
            }else{
                if (result.affectedRows === 0) {
                    return res.json({ message: "Flashcard not found.", success: false });
                }
                console.log(result)
                return res.json({message:"Flashcard deleted.",success:true,result})
            }
        })
        
    } catch (error) {
        console.log("Error occured: ",error.message)
        return res.json({message:"Internal error occured.",success:false})
        
    }
})

router.put("/flashcard/:id",(req,res)=>{
    try {
        const {id}=req.params
        const {question,answer}=req.body
        connection.query("UPDATE flashcards SET question=?,answer=? WHERE id=?",[question,answer,id],(err,result)=>{
            if(err){
                console.log("Error occured while updating flashcard. ",err.message)
                return res.json({message:"Deletion failed.",success:false})
            }else{
                if (result.affectedRows === 0) {
                    return res.json({ message: "Flashcard not found.", success: false });
                }
                console.log(result)
                return res.json({message:"Flashcard deleted.",success:true,flashcard:result})
            }
        })

    } catch (error) {
        
        console.log("Error occured: ",error.message)
        return res.json({message:"Internal error occured.",success:false})
    }
})

module.exports=router