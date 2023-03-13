//index.js

const express = require("express")
const { connect } = require("mongoose")
const app = express()
const cors = require("cors")
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
const jwt = require("jsonwebtoken")
const auth = require("./utils/auth")
const connectDB = require("./utils/database")
const  {ItemModel,UserModel} = require("./utils/schemaModels")



//ITEM Functions
//Create Item
app.post("/item/create",auth,async(req,res) =>{
    try{
        await connectDB()
        // console.log(req.body)
        await ItemModel.create(req.body)
        return res.status(200).json({message:"アイテム作成成功"})
    }catch(error){
        return res.status(400).json({message:"アイテム作成失敗"})
    }
})
//Read All Item
app.get("/",async(req,res) => {
    try{
        await connectDB()
        const allItems = await ItemModel.find()
        return res.status(200).json({message:"アイテム読み取り成功(オール)",allItems})
    }catch(error){
        return res.status(400).json({message:"アイテム読み取り失敗(オール)"})
    }
})
//Read Single Item
app.get("/item/:id",async(req,res) =>{
    try{
        await connectDB()
        const singleItem = await ItemModel.findById(req.params.id)
        return res.status(200).json({message:"アイテム読み取り成功(シングル)",singleItem:singleItem})

    }catch(error){
        res.status(400).json({message:"アイテム読み取り失敗(シングル)"})
    }
})
//Update Item
app.put("/item/update/:id",auth,async(req,res) =>{
    try{
        await connectDB()
        const singleItem = await ItemModel.findById(req.params.id)
        if(singleItem.email === req.body.email){
            await ItemModel.updateOne({_id:req.params.id},req.body)
            return res.status(200).json({message:"アイテム編集成功"})
        }else{
            throw new Error()
        }
    }catch(err){
        res.status(400).json({message:"アイテム編集失敗"})
    }
})
//Delete Item
app.delete("/item/delete/:id",auth,async(req,res) =>{
    try {
        await connectDB()
        const singleItem = await ItemModel.findById(req.params.id)
        if(singleItem.email === req.body.email){
            await ItemModel.deleteOne({_id:req.params.id})
            res.status(200).json({message:"アイテム削除成功"})
        }else{
            throw new Error()
        }
    } catch (error) {
        res.status(400).json({message:"アイテム削除失敗"})
    }
})
//USER function 
//Register User
app.post("/user/register",async(req,res) =>{
    try {
        await connectDB()
        await UserModel.create(req.body)
        return res.status(200).json({message:"ユーザー登録成功"})
    } catch (error) {
        console.log(error)
        return res.status(400).json({message:"ユーザー登録失敗"})
    }
})
//Login User
const secret_key = "mern-market"
app.post("/user/login",async(req,res) =>{
    try {
        await connectDB()
        const savedUserData = await UserModel.findOne({email:req.body.email})
        if(savedUserData){
            //ユーザーデータが存在するとき
            if(req.body.password === savedUserData.password){
                //パスワードが正しいとき
                const payload = {email:req.body.email,}
                const token = jwt.sign(payload,secret_key,{expiresIn:"23h"})
                console.log(token)
                return res.status(200).json({message:"ログイン成功",token:token})
            }else{
                //パスワードが間違っているとき
                return res.status(400).json({message:"ログイン失敗：パスワードが間違えています"})
            }
        }else{
            //ユーザーデータが存在しない場合
            return res.status(400).json({message:"ログイン失敗：ユーザー登録してください"})
        }
    } catch (error) {
        return res.status(400).json({message:"ログイン失敗"})
    }
})

//connectiong to port
const port = process.env.PORT || 5000
app.listen(port, ()=>{
    console.log('Listening on localhost port ${port}')
})

