import api from '../../../utils/api'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* hooks */
import useFlashMessage from '../../../hooks/useFlashMessage'

/* form */
import PetForm from '../../form/PetForm'

import styles from './AddPet.module.css'

function AddPet() {
    
    const [token] = useState(localStorage.getItem('token') || '')
    const {setFlashMessage} = useFlashMessage()
    const navigate = useNavigate()

    async function registerPet(pet) {
        let msgType = 'success'
        const formData = new FormData()
        await Object.keys(pet).forEach((key) => {
            if(key === 'images') {
                for(let i = 0; i< pet[key].length; i++) {
                    formData.append('images', pet[key][i])
                }
            } else {
                formData.append(key, pet[key])
            }
        })
        const data = await api.post('pets/create', formData, {
            Authorization: `Bearer ${JSON.parse(token)}`,
            'Content-Type': 'multipart/form-data' 
        })
        .then((response) => {
            return response.data
        })
        .catch((err) => {
            msgType = 'error'
            return err.response.data
        })
        setFlashMessage(data.message, msgType)
        if(msgType !== 'error') {
            navigate('/pets/mypets')
        }
    }

    return (
        <section>
            <div className={styles.addpet_header}>
                <h1>Add Pet</h1>
                <p>After you add a pet it will be
                    available for adoption and users
                    will be able to get in touch in you
                    to schedule a visit</p>
            </div>
            <PetForm handleSubmit={registerPet} btnText="Add Pet"/>
        </section>
    )
}

export default AddPet