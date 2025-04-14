import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles/AddUser.css';

const AddUser = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phone: '',
        password: '',
        roleId: 2,
    });

    const [message, setMessage] = useState('');
    const [masters, setMasters] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://localhost:7092/users/add-user', formData, {
                withCredentials: true
            });
            setMessage(response.data.message);
            fetchMasters(); // обновить список мастеров
        } catch (error) {
            setMessage(error.response?.data || 'Ошибка при добавлении пользователя');
        }
    };

    const fetchMasters = async () => {
        try {
            const response = await axios.get('https://localhost:7092/users/masters', {
                withCredentials: true
            });
            setMasters(response.data);
        } catch (error) {
            console.error('Ошибка при получении мастеров:', error);
        }
    };

    useEffect(() => {
        fetchMasters();
    }, []);

    return (
        <div className="add-user-container">
            <h2>Добавить пользователя</h2>
            <form onSubmit={handleSubmit} className="add-user-form">
                <input name="name" type="text" placeholder="Имя" value={formData.name} onChange={handleChange} required />
                <input name="surname" type="text" placeholder="Фамилия" value={formData.surname} onChange={handleChange} required />
                <input name="phone" type="text" placeholder="Телефон" value={formData.phone} onChange={handleChange} required />
                <input name="password" type="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
                <select name="roleId" value={formData.roleId} onChange={handleChange}>
                    <option value={1}>Мастер</option>
                    <option value={2}>Клиент</option>
                </select>
                <button type="submit">Добавить</button>
                {message && <p className="form-message">{message}</p>}
            </form>

            <hr />

            <h3>Список мастеров</h3>
            {masters.length > 0 ? (
                <ul>
                    {masters.map(master => (
                        <li key={master.id}>
                            {master.name} {master.surname} — {master.phone}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Мастера не найдены.</p>
            )}
        </div>
    );
};

export default AddUser;

