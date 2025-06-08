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

    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [message, setMessage] = useState('');

    // Получение всех пользователей
    const fetchAllUsers = async () => {
        try {
            const response = await axios.get('https://localhost:7092/users/all-users', {
                withCredentials: true
            });
            setAllUsers(response.data);
            setUsers(response.data); // изначально показываем всех
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    // Фильтрация пользователей
    useEffect(() => {
        let filtered = [...allUsers];

        if (roleFilter) {
            filtered = filtered.filter(user => user.roleId === parseInt(roleFilter));
        }

        if (nameFilter) {
            const lowerCaseFilter = nameFilter.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(lowerCaseFilter) ||
                user.surname.toLowerCase().includes(lowerCaseFilter)
            );
        }

        setUsers(filtered);
    }, [roleFilter, nameFilter, allUsers]);

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
            setMessage(response.data.message || 'Пользователь успешно добавлен');
            fetchAllUsers(); // обновляем список пользователей
        } catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка при добавлении пользователя');
        }
    };
    const roles = [
        { id: 1, name: "Мастер" },
        { id: 2, name: "Клиент" },
        { id: 3, name: "Администратор" }
    ];
    const getRoleName = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : "Неизвестная роль";
    };
    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
            return;
        }

        try {
            await axios.delete(`https://localhost:7092/users/delete-user/${userId}`, {
                withCredentials: true
            });
            setAllUsers(prev => prev.filter(u => u.id !== userId));
            setUsers(prev => prev.filter(u => u.id !== userId));
            setMessage("Пользователь успешно удалён");
        } catch (error) {
            setMessage("Ошибка при удалении пользователя");
            console.error("Ошибка удаления пользователя:", error);
        }
    };

    return (
        <div className="add-user-container">
            <div className="user-list-section">
                <div className="filters">
                    <input
                        type="text"
                        placeholder="Поиск"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">Все</option>
                        <option value="1">Мастера</option>
                        <option value="2">Клиенты</option>
                        <option value="3">Администраторы</option>
                    </select>
                </div>
                <div className="scrollable-table-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Фамилия</th>
                            <th>Телефон</th>
                            <th>Роль</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.surname}</td>
                                    <td>{user.phone}</td>
                                    <td>{getRoleName(user.roleId)}</td>
                                    <td>
                                        <button
                                            className="deleted-button"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">Пользователи не найдены</td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            </div>

            <div className="form-section">
                <h2>Добавить пользователя</h2>
                <form onSubmit={handleSubmit} className="add-user-form">
                    <input name="name" type="text" placeholder="Имя" value={formData.name} onChange={handleChange} required />
                    <input name="surname" type="text" placeholder="Фамилия" value={formData.surname} onChange={handleChange} required />
                    <input name="phone" type="text" placeholder="Телефон" value={formData.phone} onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
                    <select name="roleId" value={formData.roleId} onChange={handleChange}>
                        <option value={1}>Мастер</option>
                        <option value={2}>Клиент</option>
                        <option value={3}>Администратор</option>
                    </select>
                    <button type="submit">Добавить</button>
                    {message && <p className="form-message">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default AddUser;

