from flask import Blueprint, request, jsonify
from ..utils.db import cursor, db
from datetime import datetime, timedelta

premium_bp = Blueprint('premium', __name__)

@premium_bp.route('/update-role-to-premium', methods=['POST'])
def update_role_to_premium():
    data = request.get_json()
    user_id, payment_status = data.get('user_id'), data.get('payment_status')

    if payment_status != "COMPLETED":
        return jsonify(success=False, message="El pago no fue exitoso.")

    expiry_date = datetime.now() + timedelta(weeks=13)
    cursor.execute("""
        UPDATE users SET role = %s, subscription_expiry_date = %s WHERE id = %s
    """, ("premium", expiry_date, user_id))
    db.commit()

    if cursor.rowcount > 0:
        return jsonify(success=True, expiry_date=expiry_date.strftime("%Y-%m-%d"))
    return jsonify(success=False, message="No se pudo actualizar el rol.")
