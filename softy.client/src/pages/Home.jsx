import '../assets/styles/Home.css'; // Подключаем стили
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-container">
            <div className="main-container">
                <div className="content-wrapper">
                    <div className="text-section">
                        <h1 className="main-title">
                            Место, где <i>красота́<br/> и забота</i> о себе<br/> становятся <i>стилем жизни</i>
                        </h1>
                        
                        <Link to="/service" className="cta-button">Записаться на услугу</Link>
                    </div>

                    <div className="image-layout">
                        <div className="left-column">
                            <img src="../src/assets/images/home/lash.jpg " className="grid-image" />
                            <img src="../src/assets/images/home/tattoo.jpg " className="grid-image" />
                        </div>
                        <div className="right-column">
                            <img src="../src/assets/images/home/girl.jpg " className="grid-image tall" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="about-us-section">
                <h2 className="section-title">О на́с</h2>
                <div className="about-us-content">
                    {/* Первый раздел */}
                    <div className="about-us-item">
                        
                        <div className="about-us-text">
                            <p className="about-us-number"><i>01</i></p>
                            <p className="about-us-description">
                                <b>Мы предлагаем широкий спектр услуг,</b><br /> направленный на подчеркивание вашей<br /> красоты и заботу о вашей внешности.
                            </p>
                        </div>
                        <div className="about-us-image">
                            <img src="../src/assets/images/home/vibe.jpg" />
                        </div>
                    </div>

                    {/* Второй раздел */}
                    <div className="about-us-item">
                        
                        <div className="about-us-text">
                            <p className="about-us-number"><i>02</i></p>
                            <p className="about-us-description">
                                <b>Для вас работают опытные мастера,</b><br /> использующие только качественные<br /> и безопасные материалы и инструменты.
                            </p>
                        </div>
                        <div className="about-us-image">
                            <img src="../src/assets/images/home/maters.jpg" />
                        </div>
                    </div>
                </div>

                {/* Блок "Наша миссия" */}
                <div className="mission-section">
                    <h3 className="mission-title">Наша ми́ссия</h3>
                    <p className="mission-description">
                        Мы создаем гармоничное пространство для заботы о вашей красоте, помогаем раскрывать индивидуальность каждой женщины, и дарим ощущение уверенности и красоты.
                    </p>
                    
                </div>
            </div>
        </div>
    );
};

export default Home;





