import React, { useContext, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";

const AdminRoute = ({ children }) => {
    const { usuario } = useContext(UserContext);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!usuario || usuario.role !== "admin") {
                setRedirect(true);
            }
            setCheckingAuth(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [usuario]);

    if (checkingAuth) {
        return (
            <div style={{ textAlign: "center", marginTop: "100px" }}>
                <Spinner animation="border" role="status" />
                <div style={{ marginTop: "20px", fontSize: "18px" }}>
                    Comprobando acceso de administrador...
                </div>
            </div>
        );
    }

    if (redirect) {
        return <Navigate to="/inicio" />;
    }

    return children;
};

export default AdminRoute;
