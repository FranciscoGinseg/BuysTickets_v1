import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap"; // Asegúrate de tener Bootstrap y React-Bootstrap instalados
import { useTranslation } from "react-i18next";

export default function Usuarios() {
    const { t } = useTranslation();

    // Estado para el formulario de creación de usuario
    const [userData, setUserData] = useState({
        user: "",
        password: "",
        nombre: "",
        apellido: "",
        email: "",
        profile: null,
        role: "estandar",  // Se establece el valor por defecto a 'estandar'
        discapacidad: "no"  // Se establece el valor por defecto a 'no'
    });

    // Estado para la lista de usuarios y el usuario seleccionado
    const [usuarios, setUsuarios] = useState([]);  // Asegúrate de que sea un arreglo vacío
    const [selectedUser, setSelectedUser] = useState(null);

    // Estado para controlar la visibilidad del modal
    const [showModal, setShowModal] = useState(false);

    // Maneja los cambios en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Maneja el cambio del archivo de perfil
    const handleFileChange = (e) => {
        setUserData((prevData) => ({
            ...prevData,
            profile: e.target.files[0],
        }));
    };

    useEffect(() => {
        fetchUsuarios();  // Esto carga los usuarios cuando el componente se monta
        console.log("Usuarios cargados");
    }, []);

    // Enviar datos del formulario de registro
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("user", userData.user);
        formData.append("password", userData.password);
        formData.append("nombre", userData.nombre);
        formData.append("apellido", userData.apellido);
        formData.append("email", userData.email);
        formData.append("profile", userData.profile);  // Asegúrate de incluir la imagen aquí
        formData.append("role", userData.role);
        formData.append("discapacidad", userData.discapacidad);

        try {
            const response = await axios.post("http://localhost:5000/register-adminControl", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.data.success) {
                alert("Usuario creado exitosamente");
                fetchUsuarios();  // Recargar la lista de usuarios después de crear uno nuevo
                setShowModal(false); // Cerrar el modal después de enviar el formulario
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error al crear el usuario.");
        }
    };


    // Función para cargar la lista de usuarios
    const fetchUsuarios = async () => {
        try {
            const response = await axios.get("http://localhost:5000/lista-usuarios-adminControl");
            console.log("Usuarios obtenidos:", response.data);  // Verifica que los datos sean correctos

            if (response.data.success === false || !Array.isArray(response.data)) {
                setUsuarios([]); // Si no es un arreglo válido o la respuesta es de error, vacía la lista
            } else {
                setUsuarios(response.data);
            }
        } catch (error) {
            console.error("Error al cargar la lista de usuarios:", error);
            alert("Error al cargar la lista de usuarios.");
        }
    };


    // Seleccionar un usuario para mostrar sus detalles
    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    // Función para editar un usuario
    const handleEdit = (user) => {
        alert(`Editar usuario: ${user.user}`);
        // Aquí puedes añadir la lógica para editar al usuario
    };

    // Función para eliminar un usuario
    const handleDelete = (user) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar a ${user.user}?`)) {
            // Lógica para eliminar usuario
            alert(`Usuario ${user.user} eliminado.`);
            // Después de eliminar, refrescar la lista de usuarios
            fetchUsuarios();
        }
    };

    // Cargar los usuarios al cargar el componente
    useEffect(() => {
        fetchUsuarios();
    }, []);

    return (
        <div className="container mt-4">
            <h1>Usuarios</h1>

            {/* Botón para abrir el modal */}
            <Button variant="primary" className="my-3" onClick={() => setShowModal(true)}>
                Crear Usuario
            </Button>

            {/* Modal para crear un nuevo usuario */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Usuario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Usuario</label>
                            <input
                                type="text"
                                className="form-control"
                                name="user"
                                value={userData.user}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={userData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-control"
                                name="nombre"
                                value={userData.nombre}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Apellido</label>
                            <input
                                type="text"
                                className="form-control"
                                name="apellido"
                                value={userData.apellido}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={userData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Foto de perfil</label>
                            <input type="file" className="form-control" onChange={handleFileChange} />
                        </div>

                        {/* Lista de selección para el rol */}
                        <div className="mb-3">
                            <label className="form-label">Rol</label>
                            <select
                                className="form-control"
                                name="role"
                                value={userData.role}
                                onChange={handleInputChange}
                            >
                                <option value="estandar">Estandar</option>
                                <option value="premium">Premium</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Lista de selección para discapacidad */}
                        <div className="mb-3">
                            <label className="form-label">Discapacidad</label>
                            <select
                                className="form-control"
                                name="discapacidad"
                                value={userData.discapacidad}
                                onChange={handleInputChange}
                            >
                                <option value="no">No</option>
                                <option value="sí">Sí</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Crear Usuario
                        </button>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Lista de usuarios */}
            <div className="row">
                {Array.isArray(usuarios) && usuarios.length > 0 ? (
                    usuarios.map((user) => (
                        <div key={user.id} className="col-md-3 mb-3" onClick={() => handleUserClick(user)}>
                            <div className="card">
                                <div className="card-body text-center">
                                    <div className="profile-photo">
                                        {user.profile ? (
                                            <img
                                                src={`data:image/png;base64,${user.profile}`}  // Asegúrate de usar base64
                                                alt={user.user}
                                                className="rounded-circle"
                                                style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div className="rounded-circle" style={{ width: "60px", height: "60px", background: "#ccc" }}></div>
                                        )}
                                    </div>
                                    <h5>{user.user}</h5>
                                    <p>{user.role}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay usuarios disponibles.</p>
                )}

            </div>

            {/* Detalles del usuario seleccionado */}
            {selectedUser && (
                <div className="card mt-4">
                    <div className="card-body">
                        <h3>Detalles de {selectedUser.user}</h3>
                        <p><strong>Nombre:</strong> {selectedUser.name}</p>
                        <p><strong>Apellido:</strong> {selectedUser.surname}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Rol:</strong> {selectedUser.role}</p>
                        <p><strong>Discapacidad:</strong> {selectedUser.discapacidad}</p>
                        <div>
                            <button className="btn btn-warning me-2" onClick={() => handleEdit(selectedUser)}>
                                Editar
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDelete(selectedUser)}>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
