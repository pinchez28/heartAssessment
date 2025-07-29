from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
import datetime
from extensions import mongo, bcrypt

auth_bp = Blueprint("auth", __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(k in data for k in ["name", "email", "password"]):
        return jsonify({"msg": "Missing fields"}), 400
    # Check if email already exists
    if mongo.db.users.find_one({'email': data['email']}):
        return jsonify({"msg": "Email already exists"}), 409
    # Hash password and create user
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    mongo.db.users.insert_one({
        "name": data['name'],
        "email": data['email'],
        "password": hashed_pw,
        "created_at": datetime.datetime.utcnow()
    })

    return jsonify({"msg": "User registered successfully"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"msg": "Email and password are required"}), 400

    user = mongo.db.users.find_one({"email": data["email"]})
    if not user:
        return jsonify({"msg": "User not found"}), 404
    if not bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({"msg": "Incorrect password"}), 401
    # Create tokens
    access = create_access_token(identity=str(user["_id"]))
    refresh = create_refresh_token(identity=str(user["_id"]))

    return jsonify({
        "access_token": access,
        "refresh_token": refresh,
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }), 200
