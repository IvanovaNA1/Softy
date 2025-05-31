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
    const [passwordError, setPasswordError] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        const error = validatePassword(password);
        if (error) {
            setPasswordError(error);
            return;
        }

        // Чистим телефон: оставляем только цифры
        const cleanedPhone = phone.replace(/\D/g, '');

        try {
            const response = await axios.post("https://localhost:7092/account/register", {
                name,
                surname,
                phone: cleanedPhone,  // <-- Отправляем только цифры
                password,
            });

            console.log(response);
            navigate("/profile");
            window.location.reload();
        } catch (error) {
            setPasswordError("Ошибка регистрации: " + (error.response?.data?.message || "Неизвестная ошибка"));
        }
    };
    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password); // Опционально

        if (password.length < minLength) {
            return "Пароль должен содержать не менее 8 символов";
        }
        if (!hasUpperCase) {
            return "Пароль должен содержать хотя бы одну заглавную букву";
        }
        if (!hasLowerCase) {
            return "Пароль должен содержать хотя бы одну строчную букву";
        }
        if (!hasNumber) {
            return "Пароль должен содержать хотя бы одну цифру";
        }
        if (!hasSpecialChar) {
            return "Пароль должен содержать хотя бы один специальный символ (@$!%*?&)";
        }

        return "";
    };
    const handlePhoneChange = (e) => {
        let input = e.target.value;
        // Убираем всё, кроме цифр
        const digits = input.replace(/\D/g, '');

        if (digits.length === 0) {
            setPhone('');
            return;
        }

        // Форматируем как +7 (999) 999-99-99
        let formatted = '+7 ';
        if (digits.length > 1) {
            formatted += '(' + digits.substring(1, 4);
        }
        if (digits.length >= 4) {
            formatted += ') ' + digits.substring(4, 7);
        }
        if (digits.length >= 7) {
            formatted += '-' + digits.substring(7, 9);
        }
        if (digits.length >= 9) {
            formatted += '-' + digits.substring(9, 11);
        }

        setPhone(formatted);
    };
    const handleLoginRedirect = () => {
        navigate("/login"); // Переход на страницу логина (если нужно)
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
                        onChange={handlePhoneChange}
                        placeholder="+7 (999) 999-99-99"
                        required
                        className="input-field"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            const error = validatePassword(e.target.value);
                            setPasswordError(error);
                        }}
                        required
                        className="form-input"
                    />
                    {passwordError && <span className="password-error-message">{passwordError}</span>}
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

