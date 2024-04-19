const {Schema, model} = require('mongoose')
const {createHmac, randomBytes} = import("crypto");
const crypto = require("crypto");
const { createTokenforuser } = require('../services/authentication');
const userSchema = new Schema({
    fullName:{
        type : String,
        required : true,
    },
    email:{
        type : String,
        required : true,
        unique: true,
    },
    salt:{
        type : String,
    },
    password:{
        type: String,
        required : true,
    },
    profileImage:{
        type: String,
        default : "/images/user_image.jpg",
    },
    role:{
        type: String,
        enum : ["USER", "ADMIN"],
        default : "USER",
    },

},{
    timestamps : true
}
);

userSchema.pre("save", function(next) {
    const user = this;

    if( !user.isModified("password")) return ;
    const salt = crypto.randomBytes(16).toString();
    const hashedpassword = crypto.createHmac('sha256', salt).update(user.password).digest("hex");
    this.salt = salt;
    this.password = hashedpassword

    next();

})

userSchema.static("matchpasswordandgeneratetoken", async function(email, password) {
    const user =  await this.findOne({email});
    if(!user) throw new Error('User not found!');

    const salt = user.salt;
    const hashedpassword = user.password;
    const userprovided = crypto.createHmac('sha256', salt).update(password).digest("hex");

    if(userprovided!==hashedpassword) throw new Error('Incorrect password');
    const token  = createTokenforuser(user);
    return token;
})

const User = model('user', userSchema);

module.exports = User;