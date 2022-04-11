import { useState, useContext } from 'react'
import Input from '../../form/Input'

import styles from '../../form/Form.module.css'

/* context */
import { Context } from '../../../context/UserContext'
import { Link } from 'react-router-dom'

function Login() {
    const [user, setUser] = useState({})
    const { login } = useContext(Context)

    function handleChange(e) {
        setUser({...user, [e.target.name]: e.target.value})
    }

    function handleSubmit(e) {
        e.preventDefault()
        login(user)
    }

    return (
        <section className={styles.form_container}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <Input
                    text="Email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    handleOnChange={handleChange}
                />
                <Input
                    text="Password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    handleOnChange={handleChange}
                />
                <input type="submit" value="Log in" />
            </form>
            <p>
                <Link to="/register">Create account</Link>
            </p>
        </section>
    )

}
export default Login