const { connect } = require('getstream');
const bcrypt = require('bcrypt')
const StreamChat = require('stream-chat').StreamChat;
const crypto = require('crypto');
const nodemailer = require('nodemailer'); //for email sending
var moment = require('moment');  //for time stamp

require('dotenv').config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;


const signup = async (req, res) => {
    try {
        const { fullName, username, password, email } = req.body;

        const userId = crypto.randomBytes(16).toString('hex');

        const serverClient = connect(api_key, api_secret, app_id);

        const hashedPassword = await bcrypt.hash(password, 10);

        const timeStamp = Number(moment().add('120s').format('X'));

        const token = serverClient.createUserToken(userId, timeStamp, issuedAt = Math.floor(Date.now() / 1000))

        res.status(200).json({ token, fullName, username, userId, hashedPassword, email });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const serverClient = connect(api_key, api_secret, app_id);
        const client = StreamChat.getInstance(api_key, api_secret)

        const { users } = await client.queryUsers({ name: username })

        if (!users.length) return res.status(400).json({ message: 'User not found' })

        const success = await bcrypt.compare(password, users[0].hashedPassword);

        const timeStamp = Number(moment().add('120s').format('X'));

        const token = serverClient.createUserToken(users[0].id, timeStamp, issuedAt = Math.floor(Date.now() / 1000))

        if (success) {
            res.status(200).json({ token, fullName: users[0].fullName, username, userId: users[0].id })
        } else {
            res.status(500).json({ message: 'Incorrect Password' })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err })
    }
}

const forgot = async (req, res) => {
    try{
        const { checkEmail } = req.body;
        console.log(checkEmail)
        const client = StreamChat.getInstance(api_key, api_secret);
        const { users } = await client.queryUsers({ email : checkEmail })
    
        if (!users.length) return res.status(400).json({ message: 'Wrong Email.' })
        console.log(users[0].email)
        if(checkEmail===users[0].email){
            const otp = Math.floor(Math.random()*10000 + 1000);
            console.log(otp)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'gaurav.rai2020@vitbhopal.ac.in',
                    pass: 'Gaurav@1234'
                }
            });
            const mailOptions = {
                from: 'gaurav.rai2020@vitbhopal.ac.in',
                to: checkEmail,
                subject: 'Password Reset',
                text: `Your OTP is ${otp}`
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    console.log(otp)
                    return res.status(200).json({message:"OTP sent to email" , SentOtp : otp.toString() });
                }
            });
        }else{
            return res.status(500).json({message:"Email not found"})
        }
    }catch(err){
        console.log(err);
        res.status(500).json({ message: err })
    }
}

const verify = async (req, res) => {
    // const client = StreamChat.getInstance(api_key, api_secret)
    try{
        const { checkOtp, SentOtp  } = req.body;
        console.log(checkOtp,SentOtp)
        if(checkOtp===SentOtp){
            return res.status(200).json({message:"OTP verified"});
        }else{
            return res.status(500).json({message:"Wrong OTP"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({ message: err })
    }
}

const UpdatePassword = async (req, res) => {
    try{
        const { NewPassword, checkEmail } = req.body;
        const serverClient = connect(api_key, api_secret, app_id);
        const client = StreamChat.getInstance(api_key,api_secret)
        const timeStamp = Number(moment().add('120s').format('X'));
        const { users } = await client.queryUsers({ email : checkEmail })
        const token = serverClient.createUserToken(users[0].id, timeStamp, issuedAt = Math.floor(Date.now() / 1000))
        console.log(NewPassword)
        const NewhashedPassword = await bcrypt.hash(NewPassword, 10);
        console.log(NewhashedPassword)
        // if (!users.length) return res.status(400).json({ message: 'Wrong Email.' })
        if(checkEmail===users[0].email){
            return res.status(200).json({ hashedPassword: NewhashedPassword, message:"Password updated",token:token,userId:users[0].id,fullName:users[0].fullName,username:users[0].username });
            // client.connectUser({
            //     id: users[0].id,
            //     hashedPassword: NewhashedPassword
            // }, token);
            // return res.status(200).json({message:"Password updated"});
        }else{
            return res.status(500).json({message:"Email not found"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({ message: err })
    }
}
module.exports = { signup, login, forgot, verify, UpdatePassword }