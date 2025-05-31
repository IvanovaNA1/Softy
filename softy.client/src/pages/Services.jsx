import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import '../assets/styles/Service.css';

const Services = () => {
    const [services, setServices] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTimeId, setSelectedTimeId] = useState(null);
    const [bookingMessage, setBookingMessage] = useState('');
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        serviceTypeId: 1
    });
    const [message, setMessage] = useState('');
    const [editingService, setEditingService] = useState(null);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const selectedType = queryParams.get('type');
    useEffect(() => {
        axios.get('https://localhost:7092/users/profile')
            .then(response => setUserRole(response.data.roleId))
            .catch(error => console.error('Ошибка при получении профиля:', error));
    }, []);
    useEffect(() => {
        const url = selectedType
            ? `/services?type=${selectedType}`
            : '/services';

        axios.get(url)
            .then(response => setServices(response.data))
            .catch(error => console.error('Ошибка при получении данных об услугах:', error));
    }, [selectedType]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewService(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newService.name || !newService.description || !newService.price || !newService.duration) {
            setMessage('Все поля должны быть заполнены.');
            return;
        }

        if (editingService) {
            axios.put(`https://localhost:7092/services/update/${editingService.id}`, newService)
                .then(response => {
                    setServices(services.map(service =>
                        service.id === editingService.id ? response.data : service
                    ));
                    setShowForm(false);
                    setEditingService(null);
                    setNewService({ name: '', description: '', price: '', duration: '', serviceTypeId: 1 });
                    setMessage('Услуга успешно изменена!');
                    setTimeout(() => setMessage(''), 3000);
                })
                .catch(error => {
                    console.error('Ошибка при изменении услуги:', error);
                    setMessage('Произошла ошибка при изменении услуги.');
                });
        } else {
            axios.post('https://localhost:7092/services/add-service', newService)
                .then(response => {
                    setServices([...services, response.data]);
                    setShowForm(false);
                    setNewService({ name: '', description: '', price: '', duration: '', serviceTypeId: 1 });
                    setMessage('Услуга успешно добавлена!');
                    setTimeout(() => setMessage(''), 3000);
                })
                .catch(error => {
                    console.error('Ошибка при добавлении услуги:', error);
                    setMessage('Произошла ошибка при добавлении услуги.');
                });
        }
    };

    const handleDeleteService = async (serviceId) => {
        try {
            const response = await axios.delete(`https://localhost:7092/services/delete/${serviceId}`);
            if (response.status === 200) {
                setServices(services.filter(service => service.id !== serviceId));
                setMessage('Услуга успешно удалена!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Ошибка при удалении услуги:', error);
            setMessage('Произошла ошибка при удалении услуги.');
        }
    };

    const handleEditService = (service) => {
        setEditingService(service); 
        setNewService({
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            serviceTypeId: service.serviceTypeId
        });
        setShowForm(true); 
    };

    const handleBookClick = async (serviceId) => {
        setBookingMessage('');
        setSelectedService(serviceId);

        setAvailableTimes([]);
        setSelectedTimeId(null); 

        try {
            const response = await axios.get(`https://localhost:7092/orders/available-times?serviceId=${serviceId}`);
            setAvailableTimes(response.data);
        } catch (error) {
            console.error('Нет доступного для записи времени', error);
        }
    };
    const handleAddService = () => {
        setEditingService(null); 
        setNewService({
            name: '',
            description: '',
            price: '',
            duration: '',
            serviceTypeId: 1
        });
        setShowForm(true); 
    };

    const handleCreateOrder = async () => {
        if (!selectedTimeId) {
            setBookingMessage('Пожалуйста, выберите время.');
            return;
        }

        const selected = availableTimes.find(t => t.id === selectedTimeId);

        try {
            await axios.post('https://localhost:7092/orders/create', {
                availableTimeId: selectedTimeId,
                masterId: selected.masterId
            });
            setBookingMessage('Запись успешно создана!');
            setTimeout(() => setBookingMessage(''), 3000);
            setSelectedService(null);
            setAvailableTimes([]);
            setSelectedTimeId(null);
        } catch (error) {
            console.error('Ошибка при создании записи:', error);
            setBookingMessage('Ошибка при создании записи.');
        }
    };

    return (
        <div className="home-container">
            <section className="services-section">
                <h2>Наши услуги</h2>
                {userRole === 1 && (
                    <button onClick={handleAddService} className="add-service-button">
                        Добавить услугу
                    </button>)}
                {message && <div className="message">{message}</div>}
                <div className="services-list">
                    {services.length > 0 ? (
                        services.map(service => (
                            <div className="service-card" key={service.id}>
                                <h3>{service.name}</h3>
                                <div className="service-description">
                                    <p>{service.description}</p>
                                </div>
                                <div className="service-info">
                                    <span className="service-duration">{service.duration}</span>
                                    <span className="service-price">от {service.price}₽</span>
                                </div>
                                {userRole != 1 && (
                                    <button onClick={() => handleBookClick(service.id)} className="book-button">
                                        Записаться
                                    </button>)}
                                {userRole === 1 && (
                                    <>
                                        <button onClick={() => handleEditService(service)} className="edit-button">
                                            ✎
                                        </button>
                                        <button onClick={() => handleDeleteService(service.id)} className="delete-button">
                                            ✖ 
                                        </button>
                                    </>
                                )}

                            </div>
                        ))
                    ) : (
                        <p>Загрузка услуг...</p>
                    )}
                </div>
            </section>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>{editingService ? 'Изменить услугу' : 'Добавить новую услугу'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Название услуги</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newService.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Описание</label>
                                <textarea
                                    name="description"
                                    value={newService.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Цена</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={newService.price}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Длительность</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={newService.duration}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Тип услуги</label>
                                <select
                                    name="serviceTypeId"
                                    value={newService.serviceTypeId}
                                    onChange={handleInputChange}
                                >
                                    <option value="1">Ресницы</option>
                                    <option value="2">Брови</option>
                                    <option value="3">Татуировки</option>
                                </select>
                            </div>
                            <div className="button-container">
                                <button type="submit">{editingService ? 'Изменить' : 'Добавить'}</button>
                                <button type="button" onClick={() => setShowForm(false)}>Отмена</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedService && (
                <div className="modal-overlay" onClick={() => setSelectedService(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Выберите время и мастера</h3>

                        {availableTimes.length > 0 ? (
                            <>
                                <ul className="time-list">
                                    {availableTimes.map(time => (
                                        <li key={time.id}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="availableTime"
                                                    value={time.id}
                                                    checked={selectedTimeId === time.id}
                                                    onChange={() => setSelectedTimeId(time.id)}
                                                />
                                                {new Date(time.availableDate).toLocaleString()} — {time.masterName}
                                            </label>
                                        </li>
                                    ))}
                                </ul>

                                <div className="button-container">
                                    <button onClick={handleCreateOrder}>Записаться на услугу</button>
                                </div>
                            </>
                        ) : (
                            <p>Нет доступного времени для записи</p>
                        )}

                        {bookingMessage && <p className="booking-message">{bookingMessage}</p>}
                    </div>
                </div>
            )}

        </div>
    );
};

export default Services;