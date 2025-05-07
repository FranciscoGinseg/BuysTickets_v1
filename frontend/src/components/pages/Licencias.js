import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function Licencias() {
    const { t } = useTranslation();

    return (
        <div>
            <Container
                id="Licencias"
                className="p-4 rounded mt-5 text-center"
                style={{ maxWidth: "90%", backgroundColor: "#f8f9fa", boxShadow: "0px 16px 32px rgba(0, 26, 255, 0.6)" }}
            >
                <h2 className="mb-5" >{t("Licencias")}</h2>
                <p>
                    {t("Esta web es un proyecto educativo desarrollado en el marco de un curso de formación profesional. Se trata de un entorno de simulación que no tiene ningún fin comercial ni recopila ningún dato personal con fines de marketing o de uso comercial. El contenido y las imágenes en esta web se han obtenido de fuentes libres y gratuitas de derechos de autor, como ")}<strong>Canva</strong>{t(" y otros sitios web de imágenes de libre uso. Si en algún momento decides utilizar o compartir nuestras imágenes o elementos gráficos, te pedimos que, en primer lugar, te pongas en contacto con nosotros para asegurarte de que no haya conflictos con derechos de autor.") }
                </p>
                <p>
                    {t("Este proyecto es parte de un ")}<strong>{t("proyecto final educativo")}</strong>{t(" y está destinado a demostrar la capacidad técnica de los estudiantes que lo desarrollan. El pago simulado que aparece en esta plataforma es completamente ")}<strong>{t("ficticio")}</strong>{t(" y solo se utiliza con fines educativos para ilustrar el proceso de integración de ")}<strong>{t("PayPal Sandbox")}</strong>{t(". ")}<strong>{t("No se realizará ninguna transacción real, y no se almacenará dinero ni información financiera")}</strong>{t(". Es importante que sepas que la información ingresada, aunque se procese a través de un sistema simulado, no será utilizada para ningún otro fin fuera del ámbito de esta prueba educativa.") }
                </p>
            </Container>

            <Container
                id="Condiciones"
                className="p-4 rounded mt-5 text-center"
                style={{ maxWidth: "90%", backgroundColor: "#f8f9fa", boxShadow: "0px 16px 32px rgba(0, 26, 255, 0.6)" }}
            >
                <h2 className="mb-5" >{t("Condiciones de Política")}</h2>
                <p>
                    {t("Este sitio web tiene como objetivo mostrar un ")}<strong>{t("proyecto final educativo")}</strong>{t(" de desarrollo web. Su propósito es proporcionar una plataforma en la que los estudiantes puedan demostrar su capacidad para desarrollar aplicaciones web con funcionalidades como simulación de pagos, interacción con sistemas de backend, y la implementación de procesos complejos de usuario.") }
                </p>
                <p>
                    {t("Al utilizar este sitio, estás aceptando que ")}<strong>{t("el proceso de pago es simulado y no tiene ningún valor real")}</strong>{t(". La plataforma utiliza ")}<strong>{t("PayPal Sandbox")}</strong>{t(" para simular la realización de pagos y no hay ninguna transacción de dinero real. Las interacciones con la plataforma deben entenderse dentro del contexto de un entorno de aprendizaje.")}
                </p>
                <p>
                    <strong>{t(" No recopilamos datos personales")} </strong>. {t("Los datos que puedas ingresar, como nombre, correo electrónico, dirección, etc., son únicamente para demostrar el funcionamiento de una plataforma web de simulación. No somos responsables de los datos personales que decidas ingresar en la plataforma. Si decides proporcionar información personal, lo haces bajo tu propio riesgo, sabiendo que esta plataforma ")}<strong>{t("no recopila ni guarda datos para ningún otro propósito que no sea el educativo")}</strong>{t(".")}
                </p>
                <p>
                    {t("Además, se especifica que todas las imágenes utilizadas en el sitio son ")}<strong>{t("de libre uso")}</strong>{t(". Se han obtenido de fuentes como ")}<strong>{t("Canva")}</strong>{t(" y otros recursos gratuitos disponibles en la web. Si deseas utilizar imágenes de este sitio o reproducir alguna de las características visuales de la plataforma, te animamos a que nos contactes para discutir su uso o para que puedas acceder a nuestro repositorio de ")}<strong>{t("GitHub")}</strong>{t(", donde se encuentra el código fuente completo del proyecto.") }
                </p>
            </Container>

            <Container
                id="Privacidad"
                className="p-4 rounded my-5 text-center "
                style={{ maxWidth: "90%", backgroundColor: "#f8f9fa", boxShadow: "0px 16px 32px rgba(0, 26, 255, 0.6)" }}
            >
                <h2 className="mb-5" >{t("Política de Privacidad y Cookies")}</h2>
                <p>
                    {t("La ")}<strong>{t("Política de Privacidad")}</strong>{t(" de este proyecto es clara: ")}<strong>{t("No recopilamos información personal")}</strong>{t(". Esta web está diseñada para demostrar las capacidades técnicas del equipo de desarrollo en un entorno de aprendizaje. Cualquier dato que el usuario ingrese es ")}<strong>{t("solo para fines de prueba y no se almacena ni se utiliza con fines comerciales")}</strong>{t(".")}
                </p>
                <p>
                    {t("Este sitio web utiliza ")}<strong>{t("cookies")}</strong>{t(" únicamente con el propósito de garantizar una experiencia de navegación adecuada, permitiendo la simulación de transacciones, el funcionamiento de formularios de contacto y la personalización de la interfaz según las preferencias del usuario. Sin embargo, ninguna de estas cookies recoge ni procesa datos personales identificables. Si el usuario desea, puede configurar su navegador para bloquear las cookies, aunque esto podría afectar algunas de las funcionalidades del sitio web.") }
                </p>
                <p>
                    {t("Recuerda que las imágenes utilizadas en este sitio son ")}<strong>{t("libres de derechos de autor")}</strong>{t(" y se han obtenido de ")}<strong>{t("Canva")}</strong>{t(" u otras fuentes de imágenes gratuitas. No se han utilizado imágenes con restricciones de uso. Si decides utilizar alguna de las imágenes de la plataforma, puedes ponerte en contacto con nosotros o acceder al ")}<strong>{t("repositorio público de GitHub")}</strong>{t(", donde podrás ver el código completo del proyecto, incluida la implementación visual de la plataforma.") }
                </p>
            </Container>
        </div>
    );
}
