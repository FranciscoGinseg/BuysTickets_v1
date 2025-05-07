import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, Button, Container, Form, Modal, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const AdminSolicitudesYReportes = () => {
    const { t } = useTranslation();
    const [solicitudes, setSolicitudes] = useState([]);
    const [reportes, setReportes] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false); // Estado para mostrar el modal
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null); // Reporte seleccionado
    const [respuesta, setRespuesta] = useState(""); // Respuesta del administrador
    const [mensajeAnuncio, setMensajeAnuncio] = useState(""); // Mensaje del anuncio
    const [imagenAnuncio, setImagenAnuncio] = useState(null); // Imagen para el anuncio
    const [usuarios, setUsuarios] = useState([]); // Usuarios para enviar anuncio

    // Obtener las solicitudes de cuenta con discapacidad
    const obtenerSolicitudes = async () => {
        try {
            const res = await axios.get("http://localhost:5000/solicitudes-discapacidad");
            if (res.data.success === false) {
                setError(res.data.message);  // Mostrar mensaje de "no hay datos"
            } else {
                setSolicitudes(res.data);
            }
        } catch {
            setError("Error al cargar las solicitudes");
        }
    };

    const obtenerReportes = async () => {
        try {
            const res = await axios.get("http://localhost:5000/reportes");
            if (res.data.success === false) {
                setError(res.data.message);  // Mostrar mensaje de "no hay datos"
            } else {
                setReportes(res.data.reportes);
            }
        } catch {
            setError("Error al cargar los reportes");
        }
    };


    useEffect(() => {
        obtenerSolicitudes();
        obtenerReportes();
    }, []);



    // Actualizar el estado de una solicitud
    const actualizarEstadoSolicitud = async (id, nuevoEstado) => {
        try {
            // Hacer la solicitud al backend para actualizar el estado
            const res = await axios.post("http://localhost:5000/actualizar-estado-solicitud", {
                id,
                estado: nuevoEstado
            });

            if (res.data.success) {
                // Actualizar la lista de solicitudes con el nuevo estado
                setSolicitudes((prevSolicitudes) =>
                    prevSolicitudes.map((solicitud) =>
                        solicitud.id === id ? { ...solicitud, estado: nuevoEstado } : solicitud
                    )
                );

                setSuccess(t("Estado actualizado correctamente"));
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            console.error("Error al actualizar el estado:", err);
            setError(t("Error al actualizar el estado de la solicitud"));
        }
    };

    // Actualizar el estado de un reporte
    const actualizarEstadoReporte = async (id, nuevoEstado) => {
        try {
            const res = await axios.post("http://localhost:5000/actualizar-reporte", {
                id,
                estado: nuevoEstado
            });
            if (res.data.success) {
                // Actualizamos el estado localmente en el modal
                setReporteSeleccionado((prevReporte) => ({
                    ...prevReporte,
                    estado: nuevoEstado
                }));

                // Actualizar la lista de reportes
                setReportes((prevReportes) =>
                    prevReportes.map((reporte) =>
                        reporte.id === id ? { ...reporte, estado: nuevoEstado } : reporte
                    )
                );

                setSuccess(t("Estado del reporte actualizado correctamente"));
            } else {
                setError(res.data.message);
            }
        } catch {
            setError(t("Error al actualizar el estado del reporte"));
        }
    };

    // Eliminar reporte
    const eliminarReporte = async (id) => {
        try {
            const res = await axios.post("http://localhost:5000/actualizar-reporte", {
                id,
                estado: "eliminado"
            });
            if (res.data.success) {
                // Actualizamos la lista de reportes para eliminar el reporte
                setReportes((prevReportes) =>
                    prevReportes.filter((reporte) => reporte.id !== id)
                );

                setSuccess(t("Reporte eliminado correctamente"));
            } else {
                setError(res.data.message);
            }
        } catch {
            setError(t("Error al eliminar el reporte"));
        }
    };

    // Manejar la apertura del modal con el reporte seleccionado
    const verMasReporte = (reporte) => {
        setReporteSeleccionado(reporte);
        setShowModal(true);
    };

    // Enviar respuesta por correo
    const enviarRespuesta = async () => {
        if (!respuesta) {
            setError(t("Por favor, escribe una respuesta."));
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/enviar-correo-estado", {
                usuario: reporteSeleccionado.usuario,
                estado: reporteSeleccionado.estado,
                mensaje: respuesta
            });

            if (res.data.success) {
                setSuccess(t("Respuesta enviada correctamente"));
                // Actualizar el estado del reporte a 'resuelta'
                await actualizarEstadoReporte(reporteSeleccionado.id, "resuelta");
                setShowModal(false); // Cerrar el modal
                obtenerReportes(); // Recargar los reportes
            } else {
                setError(res.data.message);
            }
        } catch {
            setError(t("Error al enviar la respuesta"));
        }
    };

    // Enviar el anuncio a todos los usuarios excepto los administradores
    const enviarAnuncio = async () => {
        if (!mensajeAnuncio && !imagenAnuncio) {
            setError(t("Por favor, ingrese un mensaje o cargue una imagen."));
            return;
        }

        const formData = new FormData();
        formData.append("mensaje", mensajeAnuncio);
        if (imagenAnuncio) {
            formData.append("imagen", imagenAnuncio);
        }

        try {
            const res = await axios.post("http://localhost:5000/enviar-anuncio", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.success) {
                setSuccess(t("Anuncio enviado correctamente"));
            } else {
                setError(res.data.message);
            }
        } catch {
            setError(t("Error al enviar el anuncio"));
        }
    };

    const limpiarFormularioAnuncio = () => {
        setMensajeAnuncio("");
        setImagenAnuncio(null);
    };

    return (
        <Container className="p-4 mt-5">
            <h2>{t("Panel de Administración")}</h2>

            {/* Error/Success Alerts */}
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {/* Solicitudes de cuenta con discapacidad */}
            <h3>{t("Solicitudes de cuenta con discapacidad")}</h3>
            <Table striped bordered hover responsive className="mt-4">
                <thead>
                    <tr>
                        <th>{t("Nombre")}</th>
                        <th>{t("Apellido")}</th>
                        <th>{t("DNI")}</th>
                        <th>{t("Grado de discapacidad")}</th>
                        <th>{t("Archivo")}</th>
                        <th>{t("Estado")}</th>
                        <th>{t("Acciones")}</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudes.map((s) => (
                        <tr key={s.id}>
                            <td>{s.nombre}</td>
                            <td>{s.apellido}</td>
                            <td>{s.dni}</td>
                            <td>{s.grado_discapacidad}</td>
                            <td>
                                <a href={`http://localhost:5000/descargar-archivo/${s.id}`} target="_blank" rel="noreferrer">
                                    {t("Descargar archivo")}
                                </a>
                            </td>
                            <td>{t(s.estado)}</td>
                            <td>
                                <Button variant="success" size="sm" onClick={() => actualizarEstadoSolicitud(s.id, "aprobada")} className="me-2">{t("Aprobar")}</Button>
                                <Button variant="danger" size="sm" onClick={() => actualizarEstadoSolicitud(s.id, "rechazada")}>{t("Rechazar")}</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Reportes de errores */}
            <h3 className="mt-5">{t("Gestión de Reportes de Errores")}</h3>
            <Table striped bordered hover responsive className="mt-4">
                <thead>
                    <tr>
                        <th>{t("Usuario")}</th>
                        <th>{t("Reporte")}</th>
                        <th>{t("Estado")}</th>
                        <th>{t("Acciones")}</th>
                    </tr>
                </thead>
                <tbody>
                    {reportes.map((reporte) => (
                        <tr key={reporte.id}>
                            <td>{reporte.usuario}</td>
                            <td>{reporte.reporte}</td>
                            <td>{t(reporte.estado)}</td>
                            <td>
                                <Button variant="primary" size="sm" onClick={() => verMasReporte(reporte)}>{t("Ver más")}</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Anuncios */}
            <h3 className="mt-5">{t("Enviar un Anuncio a Todos los Usuarios")}</h3>
            <Form>
                <Form.Group controlId="formMensaje">
                    <Form.Label>{t("Mensaje del Anuncio")}</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={mensajeAnuncio}
                        onChange={(e) => setMensajeAnuncio(e.target.value)}
                        placeholder={t("Escribe el mensaje del anuncio")}
                    />
                </Form.Group>

                <Form.Group controlId="formImagen" className="mt-3">
                    <Form.Label>{t("Imagen del Anuncio")}</Form.Label>
                    <Form.Control
                        type="file"
                        onChange={(e) => setImagenAnuncio(e.target.files[0])}
                    />
                </Form.Group>

                <Button variant="primary" onClick={enviarAnuncio} className="mt-3">
                    {t("Enviar Anuncio")}
                </Button>
                <Button variant="secondary" onClick={limpiarFormularioAnuncio} className="mt-3 ms-3">
                    {t("Limpiar")}
                </Button>
            </Form>


            {/* Modal para ver más detalles y responder el reporte */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("Detalles del reporte")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {reporteSeleccionado && (
                        <>
                            <p><strong>{t("Usuario:")}</strong> {reporteSeleccionado.usuario}</p>
                            <p><strong>{t("Reporte:")}</strong> {reporteSeleccionado.reporte}</p>
                            <p><strong>{t("Estado:")}</strong> {t(reporteSeleccionado.estado)}</p>

                            <Form.Group className="mt-4">
                                <Form.Label>{t("Respuesta del Administrador")}</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={respuesta}
                                    onChange={(e) => setRespuesta(e.target.value)}
                                    placeholder={t("Escribe una respuesta...")}
                                />
                            </Form.Group>

                            {/* Botón Resuelta o Pendiente */}
                            {reporteSeleccionado.estado === "resuelta" ? (
                                <Button variant="warning" onClick={() => actualizarEstadoReporte(reporteSeleccionado.id, "pendiente")} className="mt-3">
                                    {t("Pendiente")}
                                </Button>
                            ) : (
                                <Button variant="danger" onClick={() => actualizarEstadoReporte(reporteSeleccionado.id, "resuelta")} className="mt-3">
                                    {t("Resuelta")}
                                </Button>
                            )}

                            <Button variant="primary" onClick={enviarRespuesta} className="mt-3 ms-3">
                                {t("Enviar respuesta")}
                            </Button>

                            {/* Eliminar reporte si está resuelto */}
                            {reporteSeleccionado.estado === "resuelta" && (
                                <Button variant="danger" onClick={() => eliminarReporte(reporteSeleccionado.id)} className="mt-3 ms-3">
                                    {t("Eliminar reporte")}
                                </Button>
                            )}
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AdminSolicitudesYReportes;
