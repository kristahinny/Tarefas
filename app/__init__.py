from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = "auth.login"
login_manager.login_message = "Faça login para continuar."
login_manager.login_message_category = "info"


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object("config.Config")

    db.init_app(app)
    login_manager.init_app(app)

    from app import models  # noqa

    @login_manager.user_loader
    def load_user(user_id):
        return models.Usuario.query.get(int(user_id))

    from app.routes.auth import auth_bp
    from app.routes.main import main_bp
    from app.routes.materias import materias_bp
    from app.routes.estudo import estudo_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(materias_bp)
    app.register_blueprint(estudo_bp)

    @app.context_processor
    def inject_globals():
        from datetime import date
        return {"hoje_data": date.today()}

    return app
