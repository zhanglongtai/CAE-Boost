from flask import (
    Blueprint,
    request,
    jsonify,
    Response,
)

test_api = Blueprint('test_api', __name__)


@test_api.route('/register', methods=['POST'])
def register():
    form = request.form
    print('usrname', form['username'])
    print('password', form['password'])
    print('email', form['email'])

    # response case code
    # 1 - accepted
    # 2 - username exist
    # 3 - server error

    def case1():
        return jsonify({
            'success': True,
        })

    def case2():
        return jsonify({
            'success': False,
            'error-msg': 'username-exist',
        })

    def case3():
        return Response(status=500)

    switch = {
        1: case1,
        2: case2,
        3: case3,
    }

    return switch[1]()


@test_api.route('/login', methods=['GET'])
def login():
    username = request.args.get('username')
    password = request.args.get('password')

    print('username', username)
    print('password', password)

    # response case code
    # 1 - accepted
    # 2 - username not exist
    # 3 - invalid password
    # 4 - server error

    def case1():
        return jsonify({
            'success': True,
        })

    def case2():
        return jsonify({
            'success': False,
            'error-msg': 'username-not-exist',
        })

    def case3():
        return jsonify({
            'success': False,
            'error-msg': 'invalid-password',
        })

    def case4():
        return Response(status=500)

    switch = {
        1: case1,
        2: case2,
        3: case3,
        4: case4,
    }

    return switch[4]()
