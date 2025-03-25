import express from 'express';
import mongoose from 'mongoose';
import { User } from './Model/User.js';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: 'enter name from cloudinary',
    api_key: 'your api key for cloudinary',
    api_secret: 'api secret enter here'
});

const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');

const PORT = 3000;
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('/register', (req, res) => {
    res.render('register');
});

// create user with proper error handling
app.post('/register', upload.single('file'), async (req, res) => {
    const file = req.file.path;
    const { name, email, password } = req.body;

    try {
        const cloudinaryRes = await cloudinary.uploader.upload(file, {
            folder: 'AuthProject'
        });

        let user = await User.create({
            imgUrl: cloudinaryRes.secure_url,
            name, email, password, profileImg: cloudinaryRes.secure_url
        });

        res.redirect('/login');

        console.log(name, email, password, cloudinaryRes);
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.render('login', { msg: 'User not found 😢' });
        }

        if (user.password !== password) {
            return res.render('login', { msg: 'Password is incorrect! 🔐' });
        }

        res.render('profile',{user}); // ✅ Render profile.ejs with user data

    } catch (err) {
        console.log("Error aaya babu 😵:", err);
        // res.status(500).send('Internal Server Error');
    }
});


app.get('/users', async (req, res) => {
    try {
        let users = await User.find().sort({ createdAt: -1 });  

        if (!users || users.length === 0) {
            return res.render('users', { users: [] }); // Send empty array if no users
        }

        res.render('users', { users });
    } catch (err) {
        console.log("Error fetching users:", err);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/login', (req, res) => {
    res.render('login');
});

mongoose.connect("your mongo connection string", {
    dbName: "AuthProject",
})
    .then(() => {
        console.log("Database connected");
    })
    .catch((err) => {
        console.error("Database connection error:", err);
    });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
