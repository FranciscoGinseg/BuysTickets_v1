import { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(() => {
        // Cargamos el usuario directamente de localStorage
        const usuarioGuardado = localStorage.getItem("usuario");
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    });

    const login = (userData) => {
        localStorage.setItem("usuario", JSON.stringify(userData));
        setUsuario(userData);
    };

    const logout = () => {
        localStorage.removeItem("usuario");
        setUsuario(null);
    };

    return (
        <UserContext.Provider value={{ usuario, setUsuario: login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
