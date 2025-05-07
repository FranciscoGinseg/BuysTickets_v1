import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="footer bg-dark text-light py-4">
            <Container>
                <Row>
                    <Col md={4} className="text-center text-md-start">
                        <h4>{t("Condiciones")}</h4>
                        <ul className="list-unstyled">
                            <li><a href="/licencia#Licencias" className="text-light text-decoration-none">{t("Licencias")}</a></li>
                            <li><a href="/licencia#Condiciones" className="text-light text-decoration-none">{t("Condiciones de Política")}</a></li>
                            <li><a href="/licencia#Privacidad" className="text-light text-decoration-none">{t("Política de Privacidad y Cookies")}</a></li>
                        </ul>
                    </Col>
                    <Col md={4} className="text-center">
                        <h5>{t("Redes Sociales")}</h5>
                        <div className="social-icons">
                            <a href="#" className="text-light mx-3" aria-label="Facebook">
                                <FaFacebook size={30} />
                            </a>
                            <a href="#" className="text-light mx-3" aria-label="Twitter">
                                <FaTwitter size={30} />
                            </a>
                            <a href="#" className="text-light mx-3" aria-label="Instagram">
                                <FaInstagram size={30} />
                            </a>
                        </div>
                        <h5 className="mt-4">{t("BuysTickets")}</h5>
                        <p>© {new Date().getFullYear()} {t("Todos los derechos reservados")}</p>
                    </Col>
                    <Col md={4} className="text-center text-md-end">
                        <h5>{t("Contacto")}</h5>
                        <p>{t("Correo Electrónico")}: <a href="mailto:buystickets.customer@gmail.com" className="text-light text-decoration-none">buystickets.customer@gmail.com</a></p>
                        <p>{t("Teléfono")}: <a href="tel:+34999999999" className="text-light text-decoration-none">+34 999 99 99 99</a></p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
