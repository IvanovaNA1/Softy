import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Register.css';


const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://localhost:7092/account/register", {
                name,
                surname,
                phone,
                password,
            });
            console.log(response);
            // Если регистрация успешна, перенаправляем на страницу профиля
            navigate("/profile");
            window.location.reload();
        } catch (error) {
            setErrorMessage("Ошибка регистрации: " + error.response?.data?.message);
        }
    };
    const handleLoginRedirect = () => {
        navigate("/account/login"); // Переход на страницу логина (если нужно)
    };
    return (
        <div className="register-container">
            <h2 className="register-title">Регистрация</h2>
            <form onSubmit={handleRegister} className="register-form">
                <div className="form-group">
                    <label className="form-label">Имя</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Фамилия</label>
                    <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Телефон</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="submit-button">Зарегистрироваться</button>
                <div>
                    <p>Есть аккаунт? <a href="#" onClick={handleLoginRedirect}>Войти</a></p>
                </div>
            </form>
        </div>
    );
};

export default Register;

