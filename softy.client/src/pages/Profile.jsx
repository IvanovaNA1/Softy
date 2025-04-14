import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../assets/styles/Profile.css';
const statuses = [
    { id: 1, name: "В обработке" },
    { id: 2, name: "Подтверждено" },
    { id: 3, name: "Отменено" },
    { id: 4, name: "Выполнено" },
];
const Profile = () => {
    const [user, setUser] = useState(null);
    const [services, setServices] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [calendarError, setCalendarError] = useState('');
    const [calendarSuccess, setCalendarSuccess] = useState('');
    const [timesForSelectedDate, setTimesForSelectedDate] = useState([]);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const [ setErrorMessage] = useState("");
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [statusSuccessMessage, setStatusSuccessMessage] = useState('');
    const [clientOrders, setClientOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get("https://localhost:7092/users/profile", {
                    withCredentials: true,
                });
                setUser(response.data);
                setIsUnauthorized(false);
            } catch (error) {
                const status = error.response?.status;
                if (status === 401) {
                    setIsUnauthorized(true);
                    navigate("/account/login");
                } else {
                    setErrorMessage("Ошибка загрузки профиля");
                }
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user?.roleId === 1) {
            axios.get("https://localhost:7092/services")
                .then(res => setServices(res.data));

            fetchAvailableTimes();
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        if (user.roleId === 1) {
            axios.get("https://localhost:7092/orders/master-orders", { withCredentials: true })
                .then(res => {
                    setOrders(res.data);
                    setFilteredOrders(res.data);
                })
                .catch(err => console.error("Ошибка загрузки заказов:", err));
        } else {
            axios.get("https://localhost:7092/orders/my-bookings", { withCredentials: true })
                .then(res => setClientOrders(res.data))
                .catch(err => console.error("Ошибка загрузки записей клиента:", err));
        }
    }, [user]);

    useEffect(() => {
        if (user?.roleId === 1) {
            loadOrders();
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            const response = await axios.post("https://localhost:7092/account/logout", {}, { withCredentials: true });
            if (response.status === 200) {
                navigate("/account/login");
                window.location.reload();
            }
        } catch (error) {
            console.error("Ошибка при выходе:", error);
        }
    };

    const loadOrders = async () => {
        try {
            const res = await axios.get("https://localhost:7092/orders/master-orders", {
                withCredentials: true
            });
            setOrders(res.data);
            filterOrders(res.data);
        } catch (err) {
            console.error("Ошибка загрузки заказов:", err);
        }
    };

    const updateStatus = async (orderId, newStatusId) => {
        try {
            await axios.put(`https://localhost:7092/orders/${orderId}/status`, {
                statusId: newStatusId
            }, { withCredentials: true });

            await loadOrders();
            setStatusSuccessMessage("Статус успешно обновлён.");
            setTimeout(() => setStatusSuccessMessage(''), 3000);
        } catch (err) {
            console.error("Ошибка при изменении статуса:", err);
        }
    };


    const filterOrders = (data = orders) => {
        let filtered = [...data];
        if (statusFilter) filtered = filtered.filter(o => o.statusId.toString() === statusFilter);
        if (dateFilter) filtered = filtered.filter(o => o.availableTime.availableDate.startsWith(dateFilter));
        setFilteredOrders(filtered);
    };

    useEffect(() => {
        filterOrders();
    }, [statusFilter, dateFilter]);

    const getRowClass = (statusId) => {
        switch (statusId) {
            case 1: return "row-pending";
            case 2: return "row-confirmed";
            case 3: return "row-cancelled";
            case 4: return "row-completed";
            default: return "";
        }
    };

    const fetchAvailableTimes = async () => {
        const res = await axios.get("https://localhost:7092/orders/my-available-times", {
            withCredentials: true
        });
        setAvailableTimes(res.data);
    };

    const handleAddTime = async () => {
        setCalendarError('');
        setCalendarSuccess('');

        if (!selectedDate || !selectedServiceId) {
            setCalendarError("Выберите дату и услугу.");
            return;
        }

        try {
            const formattedDate = new Date(selectedDate).toISOString();
            await axios.post("https://localhost:7092/orders/add-available-time", {
                availableDate: formattedDate,
                serviceId: selectedServiceId
            }, { withCredentials: true });

            setCalendarSuccess("Время успешно добавлено.");
            setSelectedDate('');
            setSelectedServiceId('');
            fetchAvailableTimes();
        } catch (error) {
            console.error("Ошибка при добавлении времени:", error);
            setCalendarError("Ошибка при добавлении времени.");
        }
    };

    const handleDeleteTime = async (id) => {
        await axios.delete(`https://localhost:7092/orders/remove-available-time/${id}`, {
            withCredentials: true
        });
        setAvailableTimes(prev => prev.filter(t => t.id !== id));
    };

    const handleDateClick = (date) => {
        setSelectedDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0)); // например, 9:00 по умолчанию

        const selectedDateStr = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();
        const filtered = availableTimes.filter(t => {
            const d = new Date(t.availableDate);
            const dStr = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
            return dStr === selectedDateStr;
        });
        setTimesForSelectedDate(filtered);
    };

    const highlightDates = Array.from(
        new Set(
            availableTimes.map(t => {
                const d = new Date(t.availableDate);
                return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
            })
        )
    ).map(dateStr => new Date(dateStr));

    const handleCancelOrder = (orderId) => {
        updateStatus(orderId, 3); // Отменить заказ (3 - статус "Отменено")
    };

    return (
        <div className="profile-wrapper">
            {isUnauthorized ? (
                <div className="unauthorized-message">
                    <p>Пользователь не авторизован.</p>
                    <Link to="/account/login" className="login-link">Войти</Link>
                </div>
            ) : user ? (
                <>
                    <div className="sidebar">
                        <h3>Профиль</h3>
                        <p><strong>Имя:</strong> {user.name}</p>
                        <p><strong>Фамилия:</strong> {user.surname}</p>
                        <p><strong>Телефон:</strong> {user.phone}</p>
                        <button onClick={handleLogout} className="logout-button">Выйти</button>
                    </div>

                    <div className="main-content">
                        {user.roleId === 1 ? (
                            <>
                                <h2>Записи на услуги</h2>
                                <div className="filters">
                                    <label>Фильтр по статусу:</label>
                                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                        <option value="">Все</option>
                                        {statuses.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>

                                    <label>Фильтр по дате:</label>
                                    <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                                </div>
                                    {statusSuccessMessage && (
                                        <p className="success-message">{statusSuccessMessage}</p>
                                    )}
                                <table className="order-table">
                                    <thead>
                                        <tr>
                                            <th>Клиент</th>
                                            <th>Услуга</th>
                                            <th>Дата</th>
                                            <th>Статус</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map(order => (
                                            <tr key={order.id} className={getRowClass(order.statusId)}>
                                                <td>{order.user.name} {order.user.surname}</td>
                                                <td>{order.availableTime.service.name}</td>
                                                <td>{new Date(order.availableTime.availableDate).toLocaleString()}</td>
                                                <td>{statuses.find(s => s.id === order.statusId)?.name}</td>
                                                <td>
                                                    {order.statusId === 1 && (
                                                        <>
                                                            <button onClick={() => updateStatus(order.id, 2)}>Подтвердить</button>
                                                            <button onClick={() => updateStatus(order.id, 3)}>Отменить</button>
                                                        </>
                                                    )}
                                                    {order.statusId === 2 && (
                                                        <button onClick={() => updateStatus(order.id, 4)}>Выполнить</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        ) : (
                            <>
                                        <h2>Мои записи</h2>
                                        {statusSuccessMessage && (
                                            <p className="success-message">{statusSuccessMessage}</p>
                                        )}
                                        <ul className="booking-list">
                                            {clientOrders.map(o => (
                                                <li key={o.id} className={`booking-item ${o.statusId === 3 ? 'cancelled' : ''}`}>
                                                    {o.availableTime && o.availableTime.service ? (
                                                        <>
                                                            <p><strong>Услуга:</strong> {o.availableTime.service.name}</p>
                                                            <p><strong>Дата и время:</strong> {new Date(o.availableTime.availableDate).toLocaleString()}</p>
                                                            <p><strong>Статус:</strong> {statuses.find(s => s.id === o.statusId)?.name}</p>

                                                            {/* Кнопка для отмены записи */}
                                                            {o.statusId !== 3 && (  // если заказ не отменен
                                                                <button className="cancel-button" onClick={() => handleCancelOrder(o.id)}>Отменить</button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span>Информация о услуге недоступна</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                            </>
                        )}
                    </div>
                </>
            ) : <p>Загрузка...</p>}
        
    
            {user?.roleId === 1 && (
                <div className="master-calendar-section">
                    

                    <DatePicker 
                        selected={selectedDate}
                        onChange={handleDateClick}
                        highlightDates={highlightDates}
                        inline
                    />

                    {timesForSelectedDate.length > 0 && (
                        <div className="available-times-list">
                            <h4>Время для записи</h4>
                            <ul>
                                {timesForSelectedDate.map(time => (
                                    <li key={time.id}>
                                        {new Date(time.availableDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —
                                        {services.find(s => s.id === time.serviceId)?.name || 'Неизвестная услуга'}
                                        <button onClick={() => handleDeleteTime(time.id)}>Удалить</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <h3>Добавить время для записи</h3>

                    {calendarError && <p className="error-message">{calendarError}</p>}
                    {calendarSuccess && <p className="success-message">{calendarSuccess}</p>}

                    <label>Услуга</label>
                    <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(parseInt(e.target.value))}
                    >
                        <option value="">-- Выберите услугу --</option>
                        {services.map(service => (
                            <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                    </select>

                    <label>Дата и время</label>
                    <input
                        type="datetime-local"
                        value={
                            selectedDate
                                ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
                                    .toISOString()
                                    .slice(0, 16)
                                : ''
                        }
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    />

                    <button className="add-available-time" onClick={handleAddTime}>
                        Добавить время
                    </button>
                </div>
            )}
        </div>

    );

};

export default Profile;







