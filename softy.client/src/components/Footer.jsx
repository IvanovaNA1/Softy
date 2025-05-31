import React from 'react';
import '../assets/styles/Footer.css'; 

const Footer = () => {
    return (
        <footer>
            <div className="footer-container">
                <div className="footer-logo">
                    <h2>SFT</h2>
                </div>
                
                <div className="footer-social">
                    <ul>
                        <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                        <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">VK</a></li>
                        <li><a href="https://telegram.com" target="_blank" rel="noopener noreferrer">Telegram</a></li>
                    </ul>
                </div>
            </div>
            
        </footer>
    );
};

export default Footer;
