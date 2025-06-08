import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/styles/Orders.css';

const statuses = [
    { id: 1, name: "В обработке" },
    { id: 2, name: "Подтверждено" },
    { id: 3, name: "Отменено" },
    { id: 4, name: "Выполнено" },
];

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // asc | desc

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get("https://localhost:7092/orders/all", {
                    withCredentials: true
                });
                setOrders(res.data);
                setFilteredOrders(res.data);
            } catch (error) {
                console.error("Ошибка при загрузке записей:", error);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        let result = [...orders];

        if (statusFilter) {
            result = result.filter(order => order.statusId === parseInt(statusFilter));
        }

        result.sort((a, b) => {
            const dateA = new Date(a.availableDate);
            const dateB = new Date(b.availableDate);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setFilteredOrders(result);
    }, [orders, statusFilter, sortOrder]);

    return (
        <div className="orders-page">
            <h2>Все записи салона</h2>

            <div className="table-container">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Клиент</th>
                            <th>Телефон</th>
                            <th>Мастер</th>
                            <th>Услуга</th>
                            <th>
                                Дата и время
                                <button
                                    className="sort-button"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    aria-label={`Сортировать ${sortOrder === 'asc' ? 'по убыванию' : 'по возрастанию'}`}
                                >
                                    {sortOrder === 'asc' ? '▲' : '▼'}
                                </button>
                            </th>
                            <th>
                                Статус
                                <div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        style={{ width: '70%' }}
                                    >
                                        <option value="">Все</option>
                                        {statuses.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.clientName}</td>
                                    <td>{order.clientPhone}</td>
                                    <td>{order.masterName}</td>
                                    <td>{order.serviceName}</td>
                                    <td>{new Date(order.availableDate).toLocaleString()}</td>
                                    <td>{order.statusName}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6">Записи не найдены</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;