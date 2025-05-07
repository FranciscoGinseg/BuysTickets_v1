from flask import Flask, jsonify
from flask_cors import CORS  # Importamos CORS para permitir peticiones de React

app = Flask(__name__)
CORS(app)  # Habilitamos CORS

@app.route('/api/mensaje', methods=['GET'])  # Aseguramos que sea GET
def obtener_mensaje():
    return jsonify({"mensaje": "¡Hola desde Flask!"})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
