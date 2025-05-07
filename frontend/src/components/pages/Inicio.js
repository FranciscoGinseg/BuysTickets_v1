import React from "react";
import { useTranslation } from "react-i18next";
import Carrusel from "../Carrusel";
import "./Inicio.css";

export default function Inicio() {
    const { t } = useTranslation();

    return (
        <div className="marquee-container bg-dark">
            <div className="marquee-content">
                <div className="marquee-track">
                    <div className="marquee-item">
                        <p className="marquee-text fw-bold text-white fs-3">
                            {t("Próximos eventos: teatros, cines, películas, conciertos, discotecas y muchos más.")}
                        </p>
                        <div className="marquee-images">
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                        </div>
                    </div>
                    <div className="marquee-item">
                        <p className="marquee-text fw-bold text-white fs-3">
                            {t("Próximos eventos: teatros, cines, películas, conciertos, discotecas y muchos más.")}
                        </p>
                        <div className="marquee-images">
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                        </div>
                    </div>
                    <div className="marquee-item">
                        <p className="marquee-text fw-bold text-white fs-3">
                            {t("Próximos eventos: teatros, cines, películas, conciertos, discotecas y muchos más.")}
                        </p>
                        <div className="marquee-images">
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" /><img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                            <img src="/images/logo.png" alt="Descripción" className="marquee-image" />
                        </div>
                    </div>
                </div>
            </div>
            <Carrusel />
        </div>
        
    );
}
