import api from '../../../utils/api'
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

import styles from './PetDetails.module.css'

/* hooks */
import useFlashMessage from '../../../hooks/useFlashMessage'

function PetDetails() {
    const [pet, setpPet] = useState({})
    const {id} = useParams()
    const {setFlashMessage} = useFlashMessage()
    const [token] = useState(localStorage.getItem('token') || '')

    useEffect(() => {
        api.get(`pets/${id}`).then((response) => {
            setpPet(response.data.pet)
        }, [id])
    })

    async function schedule() {

        let msgType = 'success'
        const data = await api.patch(`pets/schedule/${pet._id}`, {
            Authorization: `Bearer ${JSON.parse(token)}`
        }).then((response) => {
            return response.data
        }).catch((err) => {
            msgType = 'error'
            return err.response.data
        })
        setFlashMessage(data.message, msgType)
    }

    return (
        <>
        {pet.name && (
            <section className={styles.pet_details_container}>
                <div className={styles.pet_details_header}>
                    <h1>
                        Meet {pet.name}
                    </h1>
                    <p>If you are interested contact {pet.phone} and schedula a meeting</p>
                </div>
                <div className={styles.pet_images}>
                    {pet.images.map((images, index) => (
                        <img src={`${process.env.REACT_APP_API}/images/pet/${images}`} 
                        alt={pet.name}
                        key={index}
                        />
                    ))}
                </div>
                <p>
                    <span className='bold'>Weight: </span> {pet.weight}kg
                </p>
                <p>
                    <span className='bold'>Age: </span> {pet.age}years old
                </p>
                {token ? (
                <button onClick={schedule}>Schedule a visit</button>
                ) : (
                    <p>You must be <Link to="/register">logged in</Link> to see contact and scheule a visit</p>
                )}
            </section>
        )}
        </>
    )
}

export default PetDetails