import { useState } from 'react'
import formStyles from './Form.module.css'
import Input from './Input'
import Select from './Select'

function PetForm({handleSubmit, petData, btnText}) {

    const [ pet, setPet] = useState(petData || {}) /* receives pet data or empty */
    const [preview, setPreview] = useState([])
    const colors = ["Black", "White", "Gray", "Caramel"]

    function onFileChange(e) {
        setPreview(Array.from(e.target.files))
        setPet({...pet, images:[...e.target.files]})
    }

    function handleChange(e) {
        setPet({...pet, [e.target.name]: e.target.value})
    }

    function handleColors(e) {
        setPet({...pet, color: e.target.options[e.target.selectedIndex].text})
    }

    const submit = (e) => {
        e.preventDefault()
        handleSubmit(pet)
    }

    return(
        <form onSubmit={submit} className={formStyles.form_container}>
            <div className={formStyles.preview_pet_images}>
                {preview.length > 0
                ? preview.map((image, index) =>
                    <img 
                    src={URL.createObjectURL(image)}
                    alt={pet.name}
                    key={`${pet.name} + ${index}`}
                    />
                ) 
                : pet.images && pet.images.map((image, index) => 
                <img 
                src={`${process.env.REACT_APP_API}/images/pets/${image}`}
                alt={pet.name}
                key={`${pet.name} + ${index}`}
                />
                )
                }
            </div>
            <Input 
            text="Pet images"
            type="file"
            name="images"
            handleOnChange={onFileChange}
            multiple={true}
            />
            <Input 
            text="Pet Name"
            type="text"
            name="name"
            placeholder={"Enter the pet's name"}
            handleOnChange={handleChange}
            value={pet.name || ''}
            />
            <Input 
            text="Pet age"
            type="text"
            name="age"
            placeholder={"Enter the pet's age"}
            handleOnChange={handleChange}
            value={pet.age || ''}
            />
            <Input 
            text="Pet weight"
            type="number"
            name="weight"
            placeholder={"Enter the pet's weight"}
            handleOnChange={handleChange}
            value={pet.weight || ''}
            />
            <Select 
            name="color"
            text="Colors"
            options={colors}
            handleOnChange={handleColors}
            value={pet.color || ''}
            />
            <input type='submit' value='Save' />
        </form> 
    )
}
export default PetForm