import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"; // Importamos los nuevos componentes de PayPal
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useContext, useEffect, useState } from "react";
import { Alert, Button, Container, Form, Modal, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";

const Configuracion = () => {
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { usuario, logout } = useContext(UserContext);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [editMessage, setEditMessage] = useState("");
    const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
    const [showRecovery, setShowRecovery] = useState(false);
    const [userRecovery, setUserRecovery] = useState("");
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [codigoIngresado, setCodigoIngresado] = useState("");
    const [verificado, setVerificado] = useState(false);
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [recoveryError, setRecoveryError] = useState("");
    const [recoverySuccess, setRecoverySuccess] = useState("");
    const [showSolicitudModal, setShowSolicitudModal] = useState(false);
    const [nombreSolicitud, setNombreSolicitud] = useState("");
    const [apellidoSolicitud, setApellidoSolicitud] = useState("");
    const [dniSolicitud, setDniSolicitud] = useState("");
    const [gradoDiscapacidad, setGradoDiscapacidad] = useState("");
    const [archivoDiscapacidad, setArchivoDiscapacidad] = useState(null);
    const [estadoSolicitud, setEstadoSolicitud] = useState("");
    const [reporte, setReporte] = useState("");

    useEffect(() => {
        if (usuario) {
            setNombre(usuario.nombre || "");
            setApellido(usuario.apellido || "");
            setEmail(usuario.email || "");
            setSubscriptionExpiry(usuario.subscription_expiry_date || null);
        }
    }, [usuario]);

    useEffect(() => {
        if (!usuario?.user) return;

        const dniGuardado = localStorage.getItem("dniSolicitud");

        const consultarEstado = async () => {
            if (dniGuardado) {
                try {
                    const res = await axios.get(`http://localhost:5000/estado-solicitud/${dniGuardado}`);
                    if (res.data.success) {
                        setEstadoSolicitud(res.data.estado);
                        localStorage.setItem("estadoSolicitud", res.data.estado);
                        return;
                    }
                } catch (e) {
                    console.warn("No se encontró solicitud activa. Revisando campo discapacidad...");
                }
            }

            try {
                const res2 = await axios.get(`http://localhost:5000/estado-discapacidad/${usuario.user}`);
                if (res2.data.success) {
                    setEstadoSolicitud(res2.data.estado);
                    localStorage.setItem("estadoSolicitud", res2.data.estado);
                }
            } catch (err) {
                console.error("Error al consultar estado del usuario:", err);
            }
        };

        consultarEstado();
    }, [usuario]);

    if (!usuario) {
        return null;
    }

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file); // Establecer el archivo seleccionado
        }
    };

    const handleSaveChanges = async () => {
        setEditMessage("");

        if (newPassword && newPassword !== confirmPassword) {
            setEditMessage(t("Las contraseñas no coinciden"));
            return;
        }

        const formData = new FormData();
        formData.append("user", usuario?.user);
        formData.append("nombre", nombre);
        formData.append("apellido", apellido);
        formData.append("email", email);
        if (newPassword) {
            formData.append("newPassword", newPassword);
        }
        if (profileImage) {
            formData.append("profile", profileImage); // Añadir el archivo de perfil
        }

        // Llamar al backend para guardar los cambios
        try {
            const response = await axios.post("http://localhost:5000/update-user", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Asegúrate de enviar el FormData correctamente
                },
            });

            if (response.data.success) {
                setEditMessage(t("Cambios guardados correctamente"));
            } else {
                setEditMessage(t("Hubo un error al guardar los cambios"));
            }
        } catch (err) {
            setEditMessage(t("Error al conectar con el servidor"));
        }
    };

    const handleDeleteAccount = async () => {
        setMessage("");
        setError("");
        setLoadingDelete(true);

        if (!password) {
            setError(t("Debes ingresar tu contraseña para confirmar."));
            setLoadingDelete(false);
            return;
        }

        try {
            const response = await axios.delete("http://localhost:5000/delete-user", {
                data: {
                    user: usuario?.user,
                    password: password,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.success) {
                setMessage(response.data.message);
                setShowPasswordModal(false);
                const interval = setInterval(() => {
                    setCountdown((prev) => prev - 1);
                }, 1000);
                setTimeout(() => {
                    clearInterval(interval);
                    logout();
                    window.location.href = "/inicio";
                }, 3000);
            } else {
                setError(response.data.message || t("Error al eliminar la cuenta."));
            }
        } catch (err) {
            setError(err.response?.data?.message || t("Error al conectar con el servidor."));
        } finally {
            setLoadingDelete(false);
        }
    };

    // PayPal Button Success Handler
    const handlePaymentSuccess = async (details, data) => {
        const user_id = usuario.id;
        const payment_status = data.status;

        if (payment_status === "COMPLETED") {
            try {
                const response = await axios.post("http://localhost:5000/update-role-to-premium", {
                    user_id,
                    payment_status
                });

                if (response.data.success) {
                    // Actualiza la fecha de expiración de la suscripción en el frontend
                    setSubscriptionExpiry(response.data.expiry_date); // Actualiza la fecha de expiración que viene del backend
                    alert("Felicidades, ahora eres miembro Premium.");
                } else {
                    alert("Error al actualizar el rol.");
                }
            } catch (error) {
                console.error("Error en la actualización del rol:", error);
                alert("Hubo un problema al actualizar tu rol.");
            }
        } else {
            alert("El pago no se completó.");
        }
    };

    // Lógica para enviar código
    const handleEnviarCodigo = async () => {
        setRecoveryError("");
        try {
            const res = await axios.post("http://localhost:5000/send-recovery-code", { user: userRecovery });
            if (res.data.success) {
                setCodigoEnviado(true);
            } else {
                setRecoveryError(t(res.data.message));
            }
        } catch {
            setRecoveryError(t("Error al enviar el código. Intenta más tarde."));
        }
    };

    // Lógica para verificar código
    const handleVerificarCodigo = async () => {
        try {
            const res = await axios.post("http://localhost:5000/verify-recovery-code", {
                user: userRecovery,
                code: codigoIngresado
            });
            if (res.data.success) {
                setVerificado(true);
            } else {
                setRecoveryError(t("Código incorrecto."));
            }
        } catch {
            setRecoveryError(t("Error al verificar el código."));
        }
    };

    // Lógica para cambiar la contraseña
    const handleCambiarPassword = async () => {
        try {
            const res = await axios.post("http://localhost:5000/change-password", {
                user: userRecovery,
                new_password: nuevaPassword
            });
            if (res.data.success) {
                setRecoverySuccess(t("Contraseña cambiada exitosamente."));
                setTimeout(() => {
                    setShowRecovery(false);
                    navigate("/inicio");
                    setUserRecovery("");
                    setCodigoEnviado(false);
                    setCodigoIngresado("");
                    setVerificado(false);
                    setNuevaPassword("");
                    setRecoverySuccess("");
                }, 3000);
            } else {
                setRecoveryError(t(res.data.message));
            }
        } catch {
            setRecoveryError(t("Error al cambiar la contraseña."));
        }
    };

    // Lógica para enviar solicitud de discapacidad
    const handleEnviarSolicitudDiscapacidad = async () => {
        const formData = new FormData();
        formData.append("nombre", nombreSolicitud);
        formData.append("apellido", apellidoSolicitud);
        formData.append("dni", dniSolicitud);
        formData.append("grado_discapacidad", gradoDiscapacidad);
        formData.append("usuario", usuario.user);
        if (archivoDiscapacidad) formData.append("archivo", archivoDiscapacidad);

        try {
            const res = await axios.post("http://localhost:5000/solicitar-discapacidad", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                const estadoRes = await axios.get(`http://localhost:5000/estado-solicitud/${dniSolicitud}`);
                const estado = estadoRes.data.success ? estadoRes.data.estado : "pendiente";
                setEstadoSolicitud(estado);
                localStorage.setItem("dniSolicitud", dniSolicitud);
                localStorage.setItem("estadoSolicitud", estado); // Guarda para mantener tras recarga
                setShowSolicitudModal(false);
            } else {
                alert(t(res.data.message || "Error al enviar la solicitud."));
            }
        } catch (err) {
            alert(t(err.response?.data?.message || "Error al conectar con el servidor."));
        }
    };

    const handleEnviarReporte = async () => {
        if (!reporte) return;
    
        try {
            const response = await axios.post("http://localhost:5000/reportar-error", {
                user: usuario.user,
                reporte: reporte,
                estado: "pendiente" // Estado inicial del reporte
            });
    
            if (response.data.success) {
                alert(t("Reporte enviado exitosamente."));
                setReporte(""); // Limpiar el campo de reporte
            } else {
                alert(t("Hubo un error al enviar el reporte."));
            }
        } catch (err) {
            console.error(err);
            alert(t("Error al conectar con el servidor."));
        }
    };

    return (
        <div>
            <Container
                className="p-4 rounded mt-5 text-center"
                style={{
                    maxWidth: "90%",
                    backgroundColor: "#f8f9fa",
                    boxShadow: "0px 16px 32px rgba(0, 26, 255, 0.6)",
                }}
            >
                <h2 className="mb-4">{t("Configuración")}</h2>
                <h4 className="mb-4">{t("Editar información personal")}</h4>

                <Form>
                    <Form.Group className="mb-3 text-start">
                        <Form.Label>{t("Nombre")}</Form.Label>
                        <Form.Control
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 text-start">
                        <Form.Label>{t("Apellido")}</Form.Label>
                        <Form.Control
                            type="text"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 text-start">
                        <Form.Label>{t("Correo Electrónico")}</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 text-start">
                        <Form.Label>{t("Nueva Contraseña")}</Form.Label>
                        <Form.Control
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 text-start">
                        <Form.Label>{t("Confirmar Contraseña")}</Form.Label>
                        <Form.Control
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 text-start">
                        <Form.Label>{t("Imagen de Perfil")}</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                        />
                    </Form.Group>

                    {editMessage && <Alert variant="info">{editMessage}</Alert>}

                    <Button variant="primary" onClick={handleSaveChanges}>
                        {t("Guardar cambios")}
                    </Button>
                </Form>
            </Container>

            {/* Sección Premium con PayPal */}
            <Container className="p-4 my-5 rounded" style={{ maxWidth: "90%", backgroundColor: "#f8f9fa", boxShadow: "0px 16px 32px rgb(225, 255, 0)" }}>
                <h2 className="mb-4">{t("Accede a nuestra membresía Premium")}</h2>
                <p>{t("Disfruta de beneficios exclusivos como contenido adicional, descuentos y más.")}</p>

                <div>
                    <h4>{t("Suscríbete ahora a la membresía Premium")}</h4>
                    <PayPalScriptProvider options={{ "client-id": "ASvkIXiz4RnGPy4svXrR4Uom-V2XscZs-wWSDUZcQbVIbWhgs5_BFB5KHiEoB1rt6eAacvaojsu_OF6W" }}>
                        <PayPalButtons
                            style={{ layout: "vertical" }}
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    purchase_units: [{
                                        amount: {
                                            value: "2.99" // Precio de la suscripción Premium
                                        }
                                    }]
                                });
                            }}
                            onApprove={handlePaymentSuccess} // Llamar a handlePaymentSuccess después de aprobar el pago
                        />
                    </PayPalScriptProvider>

                    {usuario.role === "premium" && (
                        <div className="alert alert-success">
                            {t("Eres un usuario Premium.")}
                            <br />
                            {t("Tu suscripción vence el")} {subscriptionExpiry}.
                        </div>
                    )}

                    {usuario.role === "estandar" && (
                        <div className="alert alert-warning">
                            {t("Eres un usuario estándar.")}
                        </div>
                    )}
                </div>
            </Container>

            {/* Solicitud de cuenta en discapacidad */}
            <Container className="p-4 my-5 rounded" style={{ maxWidth: "90%", backgroundColor: "#f8f9fa", boxShadow: "0px 16px 32px rgba(0, 26, 255, 0.6)" }}>
                <Button variant="primary" onClick={() => setShowSolicitudModal(true)}>
                    {t("Solicitar cuenta con discapacidad")}
                </Button>

                <Modal show={showSolicitudModal} onHide={() => setShowSolicitudModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{t("Solicitud de cuenta con discapacidad")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Nombre")}</Form.Label>
                                <Form.Control value={nombreSolicitud} onChange={(e) => setNombreSolicitud(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Apellido")}</Form.Label>
                                <Form.Control value={apellidoSolicitud} onChange={(e) => setApellidoSolicitud(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("DNI")}</Form.Label>
                                <Form.Control value={dniSolicitud} onChange={(e) => setDniSolicitud(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Grado de discapacidad")}</Form.Label>
                                <Form.Control value={gradoDiscapacidad} onChange={(e) => setGradoDiscapacidad(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Informe médico o certificado")}</Form.Label>
                                <Form.Control type="file" onChange={(e) => setArchivoDiscapacidad(e.target.files[0])} accept="application/pdf,image/*" />
                            </Form.Group>
                            <Button
                                className="w-100"
                                onClick={handleEnviarSolicitudDiscapacidad}
                                disabled={!nombreSolicitud || !apellidoSolicitud || !dniSolicitud || !gradoDiscapacidad || !archivoDiscapacidad}
                            >
                                {t("Enviar solicitud")}
                            </Button>

                        </Form>
                    </Modal.Body>
                </Modal>

                {estadoSolicitud && (
                    <Alert
                        variant={
                            estadoSolicitud === "pendiente"
                                ? "warning"
                                : estadoSolicitud === "aprobada"
                                    ? "success"
                                    : "danger"
                        }
                        className="mt-3"
                    >
                        {t("Estado de la solicitud")}: {t(estadoSolicitud)}
                    </Alert>
                )}
            </Container>

            {/* Reportes de errores o bugs */}
            <Container
                className="p-4 my-5 rounded"
                style={{ maxWidth: "90%", backgroundColor: "#f8f9fa", boxShadow: "0px 16px 32px rgba(0, 26, 255, 0.6)" }}
            >
                <h2 className="mb-4">{t("Reportes de Errores o Fallos")}</h2>

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("Describe el error o fallo")}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={reporte}
                            onChange={(e) => setReporte(e.target.value)}
                            placeholder={t("Escribe el reporte aquí...")}
                        />
                    </Form.Group>

                    <Button
                        variant="primary"
                        onClick={handleEnviarReporte}
                        disabled={!reporte}
                    >
                        {t("Enviar reporte")}
                    </Button>
                </Form>
            </Container>

            {/* Zona peligrosa */}
            <Container
                className="p-4 rounded my-5 text-center"
                style={{ maxWidth: "90%", backgroundColor: "#f8f9fa", boxShadow: "0px 16px 32px rgba(255, 0, 0, 0.6)" }}
            >
                <h2 className="mb-4">{t("Zona peligrosa")}</h2>
                <p>{t("Si eliminas tu cuenta:")}</p>
                <ul className="list text-start px-5">
                    <li>{t("No podrás comprar más entradas")}</li>
                    <li>{t("Toda tu información será eliminada permanentemente")}</li>
                    <li>{t("Las entradas impresas o descargadas podrían seguir siendo válidas, pero no podrás acceder a ellas desde tu cuenta")}</li>
                </ul>
                <Button variant="danger" onClick={() => setShowPasswordModal(true)}>
                    {t("Borrar mi cuenta")}
                </Button>
                {message && (
                    <Alert variant="success" className="mt-3">
                        {message}
                        <br />
                        {t("Redirigiendo en")} {countdown} {t("segundos...")}
                    </Alert>
                )}
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Container>

            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("Confirmar eliminación de cuenta")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message ? (
                        <Alert variant="success">
                            {message}
                        </Alert>
                    ) : (
                        <Form onSubmit={(e) => { e.preventDefault(); handleDeleteAccount(); }}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("Contraseña")}:</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("Introduce tu contraseña")}
                                    required
                                />
                            </Form.Group>
                            <Button variant="danger" type="submit" className="w-100" disabled={loadingDelete}>
                                {loadingDelete ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        {t("Cargando...")}
                                    </>
                                ) : (
                                    t("Confirmar y eliminar cuenta")
                                )}
                            </Button>
                        </Form>
                    )}
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Configuracion;
