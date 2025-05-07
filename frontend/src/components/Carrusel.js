import React from "react";
import { Carousel, Col, Row } from "react-bootstrap";

const Carrusel = () => {
    return (
        <Carousel>
            <Carousel.Item>
                <Row className="justify-content-center">
                    <Col md={4}>
                        <img
                            className="d-block w-100"
                            src="/images/ANUNCIO DE PRUEBA.png"
                            alt="Evento 1"
                        />
                    </Col>
                    <Col md={4}>
                        <img
                            className="d-block w-100"
                            src="/images/ANUNCIO2.png"
                            alt="Evento 2"
                        />
                    </Col>
                    <Col md={4}>
                        <img
                            className="d-block w-100"
                            src="/images/ANUNCIO3.png"
                            alt="Evento 3"
                        />
                    </Col>
                </Row>
                <Carousel.Caption>
                    <h3>Eventos Destacados</h3>
                    <p>Descubre los mejores eventos de la temporada</p>
                </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
                <Row className="justify-content-center">
                    <Col md={4}>
                        <img
                            className="d-block w-100"
                            src="/images/ANUNCIO4.png"
                            alt="Evento 4"
                        />
                    </Col>
                    <Col md={4}>
                        <img
                            className="d-block w-100"
                            src="/images/ANUNCIO5.png"
                            alt="Evento 5"
                        />
                    </Col>
                    <Col md={4}>
                        <img
                            className="d-block w-100"
                            src="/images/ANUNCIO6.png"
                            alt="Evento 6"
                        />
                    </Col>
                </Row>
                <Carousel.Caption>
                    <h3>Próximos Eventos</h3>
                    <p>No te pierdas lo que viene</p>
                </Carousel.Caption>
            </Carousel.Item>
        </Carousel>
    );
};

export default Carrusel;
