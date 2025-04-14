import '../assets/styles/Home.css'; // Подключаем стили

const Home = () => {

    return (
        <div className="home-container">
            <h1>Добро пожаловать в наш салон красоты!</h1>
            <p>Мы предлагаем широкий спектр услуг для вашего комфорта и красоты.</p>

           

            {/* Кнопка для модалки */}
           

            <section className="contact-section">
                <h2>Контактная информация</h2>
                <p><strong>Телефон:</strong> +7 (800) 123-45-67</p>
                <p><strong>Email:</strong> salon@example.com</p>
                <p><strong>Адрес:</strong> ул. Примерная, 12, Москва, Россия</p>
            </section>
        </div>
    );
};

export default Home;





