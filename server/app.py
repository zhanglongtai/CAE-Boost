from flask import Flask

import config

from routes.download_api import download_api


def configured_app():
    flask_init = Flask(__name__)
    flask_init.secret_key = config.secret_key
    register_routes(flask_init)
    return flask_init


def register_routes(flask_app):
    flask_app.register_blueprint(download_api)


if __name__ == "__main__":
    app = configured_app()
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.jinja_env.auto_reload = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    config = dict(
        debug=True,
        host='127.0.0.1',
        port=3000,
    )
    app.run(**config)
