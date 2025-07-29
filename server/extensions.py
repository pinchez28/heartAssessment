from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

mongo = PyMongo()
jwt = JWTManager()
bcrypt = Bcrypt()
