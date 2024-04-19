const express = require("express");
const path = require("path");
const app = express();
const cookieparser = require("cookie-parser")
const mongoose  = require("mongoose");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { checkforauthenticationcookie } = require("./middlewares/authentication");
const PORT = 8000;
app.set("views", path.resolve("./views"));

const Blog = require('./models/blog')
app.use(express.static(path.resolve('./public')));
mongoose.connect('mongodb://localhost:27017/blogify').then((e) => console.log("mongodb is connected"))

app.use(express.urlencoded({extended : false}));
app.use(cookieparser())
app.use(checkforauthenticationcookie('token'));



app.use('/user', userRoute);
app.set('view engine', 'ejs');
app.use('/blog', blogRoute);

app.get('/',  async (req, res) =>{
    const allBlogs = await Blog.find({});
        res.render("home",{
        user : req.user,
        blogs : allBlogs,
    });
})
app.listen(PORT, () =>{
    console.log(`Server is running at PORT : ${PORT}`)
});

