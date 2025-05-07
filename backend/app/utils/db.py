import mysql.connector
from config import Config

db = mysql.connector.connect(
    host=Config.DB_HOST,
    user=Config.DB_USER,
    password=Config.DB_PASSWORD,
    database=Config.DB_NAME
)

cursor = db.cursor(dictionary=True)
