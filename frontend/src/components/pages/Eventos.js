import React from "react";

export default function Eventos() {
    const eventos = [
        { id: 1, titulo: "Concierto", fecha: "2025-04-15", lugar: "Madrid" },
        { id: 2, titulo: "Taller React", fecha: "2025-04-18", lugar: "Online" },
    ];

    return (
        <div className="flex flex-col items-center justify-center h-screen p-6">
            <h2 className="text-3xl font-bold mb-6">Eventos</h2>
            <ul className="w-full max-w-md space-y-4">
                {eventos.map((evento) => (
                    <li
                        key={evento.id}
                        className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                        <strong className="block text-xl">{evento.titulo}</strong>
                        <span className="text-gray-600">{evento.fecha}</span> -{" "}
                        <span className="text-gray-600">{evento.lugar}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}