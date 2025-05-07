import React, { useContext, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";

const PrivateRoute = ({ children }) => {
    const { usuario } = useContext(UserContext);
    const [showSpinner, setShowSpinner] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        // Esperamos 2 segundos en todos los casos para animación
        const timer = setTimeout(() => {
            if (!usuario) {
                setShouldRedirect(true);
            }
            setShowSpinner(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [usuario]);

    if (showSpinner) {
        return (
            <div style={{ textAlign: "center", marginTop: "100px" }}>
                <Spinner animation="border" role="status" />
                <div style={{ marginTop: "20px", fontSize: "18px" }}></div>
            </div>
        );
    }

    if (shouldRedirect) {
        return <Navigate to="/inicio" />;
    }

    return children;
};

export default PrivateRoute;
