from flask import (
    Blueprint,
    send_from_directory,
)

download_api = Blueprint('download_api', __name__)


@download_api.route('/download/<filename>')
def download_file(filename):
    return send_from_directory('files', filename)
