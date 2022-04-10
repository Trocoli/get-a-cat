const Pet = require('../models/Pet')

// helpers
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const ObjectID = require('mongoose').Types.ObjectId

module.exports = class PetController {

    // create a pet
    static async create(req, res) {
        
        const { name, age, weight, color } = req.body
        const images = req.files
        const available = true 

        //images upload
        // validation 

        if(!name) {
            res.status(422).json({message: 'You must enter a name'})
            return
        }
        if(!age) {
            res.status(422).json({message: 'You must enter an age'})
            return
        }
        if(!weight) {
            res.status(422).json({message: 'You must enter a weight'})
            return
        }
        if(!color) {
            res.status(422).json({message: 'You must enter a color'})
            return
        }
        if(images.length === 0) {
            res.status(422).json({message: 'You must insert at least one picture'})
            return
        }
      
        //get user
        const token = getToken(req)
        const user = await getUserByToken(token)
        // create
        const pet = new Pet({
            name,
            age,
            weight,
            color,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone
            }
        })

        images.map((image) => {
            pet.images.push(image.filename)
        })

        try {
            const newPet = await pet.save()
            res.status(201).json({message: "Pet successfully addeed",newPet})
        } catch (error) {
            res.status(500).json({message: error})
        }
    }

    static async getAll(req, res) {
        const pets = await Pet.find().sort('-createdAt')

        res.status(200).json({
            pets: pets,
        })
    }


    static async getAllUserPets(req, res) {

        // get user from token 
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'user._id': user._id}).sort('-created')

        res.status(200).json({
            pets,
        })
    }

    static async getAllUserAdoptions(req, res) {
                // get user from token 
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'adopter._id': user._id}).sort('-created')

        res.status(200).json({
            pets,
        })
    }

    static async getPetById(req, res) {
        const id = req.params.id
        //check if id is valid
        if(!ObjectID.isValid(id)){
            res.status(422).json({message: 'Invalid ID!'})
            return
        }
        // check if pet exists
        const pet = await Pet.findOne({_id: id})
        if(!pet) {
            res.status(404).json({message: 'Pet not found!'})
        }
        res.status(200).json({
            pet: pet
        })
    }

    static async removePetById(req, res){
        const id = req.params.id 
        if(!ObjectID.isValid(id)){
            res.status(422).json({message: 'Invalid ID!'})
            return
        }
        // check if pet exists
        const pet = await Pet.findOne({_id: id})
        if(!pet) {
            res.status(404).json({message: 'Pet not found!'})
            return
        }


        // check logged user if is owner 
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({
                message: 'Only the owner can delete a pet'
            })
            return
        }
        await Pet.findByIdAndRemove(id)
        res.status(200).json({message: "Successfully removed pet"})
    }

    static async updatePet(req, res) {
        const id = req.params.id
        const {name, age, weight, color, available} = req.body
        const images = req.files
        const updatedData = {}

        // check if pet exists 
        const pet = await Pet.findOne({_id: id})
        if(!pet) {
            res.status(404).json({message: 'Pet not found!'})
            return
        }
                // check logged user if is owner 
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({
                message: 'Only the owner can edit a pet'
            })
            return
        }

        
        if(!name) {
            res.status(422).json({message: 'You must enter a name'})
            return
        }else {
            updatedData.name = name
        }
        if(!age) {
            res.status(422).json({message: 'You must enter an age'})
            return
        }else{
            updatedData.age = age
        }
        if(!weight) {
            res.status(422).json({message: 'You must enter a weight'})
            return
        }else {
            updatedData.weight = weight
        }
        if(!color) {
            res.status(422).json({message: 'You must enter a color'})
            return
        }else {
            updatedData.color = color 
        }
        if(images.length === 0) {
            res.status(422).json({message: 'You must insert at least one picture'})
            return
        }else {
            updatedData.images = []
            images.map((images) => {
                updatedData.images.push(images.filename)
            })
        }
        await Pet.findByIdAndUpdate(id, updatedData)
        res.status(200).json({message: "pet updated!"})
      
    }

    static async schedule(req, res) {

        const id = req.params.id
        // check if pet exists
        const pet = await Pet.findOne({_id: id})
        if(!pet) {
            res.status(404).json({message: 'Pet not found!'})
            return
        }
        // check if user is owner of pet 
        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.equals(user._id)) {
            res.status(422).json({
                message: 'You can\'t schedule a visit to adopt your own pet. '
            })
            return
        }
        // check if user ha already scheduled a visit
        if(pet.adopter) {
            if(pet.adopter._id.equals(user._id)){
                res.status(422).json({
                    message: 'You already shceduled a visit.'
                })
                return
            }
        }
        // add user to pet
        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image
        }
        await Pet.findByIdAndUpdate(id, pet)
        res.status(200).json({
            message: `Visit scheduled successfully, contact ${pet.user.name} on ${pet.user.phone}`
        })
    }

    static async concludeAdoption(req, res) {

        const id = req.params.id
        // check if pet exists
        const pet = await Pet.findOne({_id: id})
        if(!pet) {
            res.status(404).json({message: 'Pet not found!'})
            return
        
        }
        const token = getToken(req)
        const user = await getUserByToken(token)
        if(pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({
                message: 'Only the owner can access this'
            })
            return
        }

        pet.available = false
        await Pet.findByIdAndUpdate(id, pet)
        res.status(200).json({
            message: 'Pet was adopetd!'
        })


    }

}