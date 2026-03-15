require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/ajioLogin")
    .then(()=>console.log("MongoDB Connected"))
    .catch(err=>console.log(err));

const userSchema = new mongoose.Schema({
    phone:{type:String,unique:true,sparse:true},
    password:{type:String},
    email:{type:String,unique:true,sparse:true},
    otp:{type:String}
});
const User = mongoose.model("User", userSchema);



app.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });

        let user = await User.findOne({ email });
        if (!user) user = new User({ email });

        const otp = otpGenerator.generate(6, {
            digits: true,
            alphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        user.otp = otp;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            tls: { rejectUnauthorized: false }
        });

       await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Login",
    text: `Your OTP is: ${otp}.`
});

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


app.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        user.otp = null;
        await user.save();
        res.json({ success: true, message: "Login successful" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});










app.post("/login", async(req,res)=>{
    try{
        const {phone,password} = req.body;
        const user = await User.findOne({phone});
        if(!user || user.password!==password) return res.json({success:false,message:"Invalid phone or password"});
        res.json({success:true,message:"Login successful"});
    } catch(err){
        res.status(500).json({success:false,message:"Server error"});
    }
});

const storage = multer.diskStorage({
    destination:(req,file,cb)=>cb(null,"uploads/"),
    filename:(req,file,cb)=>cb(null,Date.now()+path.extname(file.originalname))
});
const upload = multer({storage});
app.use("/uploads",express.static("uploads"));

const productSchema = new mongoose.Schema({
    itemName:String,
    itemQuantity:Number,
    itemPrice:Number,
    image:String
});
const Product = mongoose.model("Product",productSchema);

app.post("/additem", upload.single("image"), async(req,res)=>{
    try{
        const newProduct = new Product({
            itemName:req.body.itemName,
            itemQuantity:req.body.itemQuantity,
            itemPrice:req.body.itemPrice,
            image:req.file ? req.file.filename : null
        });
        await newProduct.save();
        res.json({success:true,message:"Product added"});
    } catch(err){
        res.status(500).json({message:"Server error"});
    }
});

app.get("/products", async(req,res)=>{
    const products = await Product.find();
    res.json(products);
});

app.get("/product/:id", async(req,res)=>{
    const product = await Product.findById(req.params.id);
    res.json(product);
});

app.put("/updateitem/:id", upload.single("image"), async(req,res)=>{
    try{
        let data = {
            itemName:req.body.itemName,
            itemQuantity:Number(req.body.itemQuantity),
            itemPrice:Number(req.body.itemPrice)
        };
        if(req.file) data.image = req.file.filename;
        const product = await Product.findByIdAndUpdate(req.params.id,data,{new:true});
        res.json({success:true,product});
    } catch(err){
        res.status(500).send("Error updating product");
    }
});

app.delete("/product/:id", async(req,res)=>{
    const product = await Product.findById(req.params.id);
    if(product.image){
        const imagePath = "uploads/"+product.image;
        if(fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({message:"Product deleted"});
});

app.listen(5000, () => console.log("Server running on port 5000"));