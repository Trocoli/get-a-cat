import {useContext, useState} from 'react'

import Input from '../../form/Input'
import styles from '../../form/Form.module.css'
import { Link } from 'react-router-dom'

/* contexts */
import {Context} from '../../../context/UserContext'

function Register() {

    const [user, setUser] = useState({})
    const {register} = useContext(Context)

    function handleChange(e) { // event
        setUser({...user, [e.target.name]: e.target.value})
    }

    function handleSubmit(e) {
        e.preventDefault()
        // send user to db
        register(user)
    }

    return (
        <section className={styles.form_container}>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <Input 
                text="Name"
                type="text"
                name="name"
                placeholder="Insert name"
                handleOnChange={handleChange}
                />
                <Input 
                text="Phone"
                type="text"
                name="phone"
                placeholder="Insert phone number"
                handleOnChange={handleChange}
                />
                <Input 
                text="Email"
                type="email"
                name="email"
                placeholder="Insert your email"
                handleOnChange={handleChange}
                />
                <Input 
                text="Password"
                type="password"
                name="password"
                placeholder="Enter a password"
                handleOnChange={handleChange}
                />
                <Input 
                text="Confirm password"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                handleOnChange={handleChange}
                />
                <input type="submit" value="save" />
            </form>
            <p>
            Already registered? <Link to='/login'>Log in</Link>
            </p>
        </section>
    )

}
export default Register