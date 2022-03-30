const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController{

    static async register(req, res) {

        const {name,
            email,
            phone,
            password,
            confirmPassword} = req.body


        //validations 
        if(!name) {
            res.status(422).json({message: 'You must enter a name'})
            return 
        }
        if(!email) {
            res.status(422).json({message: 'You must enter an email'})
            return 
        }
        if(!phone) {
            res.status(422).json({message: 'You must enter a phone'})
            return 
        }
        if(!password) {
            res.status(422).json({message: 'You must enter a password'})
            return 
        }
        // check if passwords match
        if(!confirmPassword) {
            res.status(422).json({message: 'You must enter enter the password confirmation'})
            return 
        }
        if(password !== confirmPassword) { // operador identico valida tipo e conteudo
            res.status(422).json({message: 'Passwords don\'t match'  })
        }
        // check if user exists 
        const userExists = await User.findOne({email: email})
        if(userExists) {
            res.status(422).json({ message: "Email already in use!"})
            return
        }

        // create a pasword
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password,salt)
        //create a user
        const user = new User({
            name: name,
            email: email,
            phone: phone,
            password: passwordHash,
        })
        try {
            const newUser = await user.save()
            await createUserToken(newUser, req, res)
        } catch (error) {
            res.status(500).json({message:  error})
        }
    }
    static async login(req, res) {
        const {email, password} = req.body
        if(!email) {
            res.status(422).json({message: 'You must enter an email'})
            return 
        }


        // check if user exists 
        const user = await User.findOne({email: email})
        if(!user) {
            res.status(422).json({ message: "Email not found!"})
            return
        }


        if(!password) {
            res.status(422).json({message: 'You must enter a password'})
            return 
        }

        
        // check if password is correct
        const checkPassword = await bcrypt.compare(password, user.password)
        if(!checkPassword) {
            res.status(422).json({ message: "Incorrect password!"})
            return
        }
        await createUserToken(user, req, res)
    }

    static async checkUser(req, res) { // get logged in user from the JWT 

        let currentUser
        console.log(req.headers.authorization)

        if(req.headers.authorization) {

            const token = getToken(req)
            const decoded = jwt.verify(token, 'nossosecret') // jwt function to get user from the token
            currentUser = await User.findById(decoded.id)
            currentUser.password = undefined //remove password from object

        } else {
            currentUser = null
        }
        res.status(200).send(currentUser)
    }
    static async getUserById(req, res) {
        const id = req.params.id // it comes dynamicly from the url route as a param of request 
        const user =  await User.findById(id).select("-password")
        if(!user) {
            res.status(422).json({message: 'User not found'})
            return 
        }
        res.status(200).json({ user })

    }
    // update user
    static async editUser(req, res) {
        const id = req.params.id

        // check if user exists
        const token = getToken(req)
        const user = await getUserByToken(token)

        const {name, email, phone, password, confirmPassword} = req.body

        if (req.file) {
            user.image = req.file.filename 
        }

        // validation 
        if(!name) {
            res.status(422).json({message: 'You must enter a name'})
            return 
            user.name = name
        }
        if(!email) {
            res.status(422).json({message: 'You must enter an email'})
            return 
        }
         // check if email is taken
        const userExists =  await User.findOne({email: email})
        if(user.email !== email && userExists) {
            res.status(422).json({message: 'Email already in use'})
            return 
        }
        user.email = email 

        if(!phone) {
            res.status(422).json({message: 'You must enter a phone'})
            return 
        }
        user.phone = phone
        // password change is optional, if user chooses to change password ask to confirm
        // and check if passwords match, if it does create new hash and save 
        if(password != confirmPassword) {
            res.status(422).json({message: "passwords don't match"})
        } else if (password === confirmPassword && password != null) {
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)
            user.password = passwordHash
        }
        try {
            
            /// return user updated data
            await User.findOneAndUpdate(
                {_id: user._id},
                {$set: user},
                {new: true},)
            res.status(200).json({message: 'user updated'})


        } catch (error) {
            
            res.status(500).json({message: error})
            return

        }
}
}