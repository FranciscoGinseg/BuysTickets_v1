import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const useAuthGuard = ({ adminOnly = false } = {}) => {
    const { usuario, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Esperamos a que el Contexto haya leído localStorage
        if (usuario === null) return; // <-- Espera inicial

        const validarUsuario = async () => {
            if (!usuario || !usuario.user) {
                logout();
                navigate("/inicio");
                return;
            }

            try {
                const response = await axios.post("http://localhost:5000/verify-user", {
                    user: usuario.user,
                });

                if (!response.data.exists) {
                    logout();
                    navigate("/inicio");
                    return;
                }
            } catch (err) {
                console.error("Fallo al verificar con el servidor:", err);
                logout();
                navigate("/inicio");
                return;
            }

            if (adminOnly && usuario.role !== "admin") {
                logout();
                navigate("/inicio");
                return;
            }

            setLoading(false);
        };

        validarUsuario();
    }, [usuario, adminOnly, logout, navigate]);

    return { loading, usuario, logout };
};

export default useAuthGuard;
