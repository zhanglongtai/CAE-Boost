from flask import (
    Blueprint,
    request,
    jsonify,
    Response,
)
import time

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
            'token': 'token',
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
            'token': 'token',
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

    return switch[1]()


@test_api.route('/task-list', methods=['GET'])
def task_list():
    username = request.args.get('username')
    token = request.args.get('token')

    print('username', username)
    print('token', token)

    # response case code
    # 1 - accepted
    # 2 - server error

    def case1():
        fake_data = [
            {
                'name': 'fluent计算测试',
                'id': '6bf9cc22',
                'solver': 'Fluent',
                'state': 'running',
                'creatTime': '2018-02-08 12:00',
                'duration': '5.2 hour',
            },
            {
                'name': 'su2计算测试',
                'id': '17107d9a',
                'solver': 'SU2',
                'state': 'stopped',
                'creatTime': '2018-02-08 12:00',
                'duration': '31.2 hour',
            },
            {
                'name': 'openfoam计算测试',
                'id': '2d2a9012',
                'solver': 'OpenFoam',
                'state': 'finished',
                'creatTime': '2018-02-08 12:00',
                'duration': '1.2 hour',
            },
        ]

        time.sleep(2)

        return jsonify({
            'task-list': fake_data,
        })

    def case2():
        return Response(status=500)

    switch = {
        1: case1,
        2: case2,
    }

    return switch[1]()


@test_api.route('/account', methods=['GET'])
def account():
    username = request.args.get('username')
    token = request.args.get('token')

    print('username', username)
    print('token', token)

    # response case code
    # 1 - accepted
    # 2 - server error

    def case1():
        return jsonify({
            'balance': '0.00',
            'voucher': '0.00',
            'charge-record': [],
            'consume-record': [],
        })

    def case2():
        return Response(status=500)

    switch = {
        1: case1,
        2: case2,
    }

    return switch[1]()


@test_api.route('/password', methods=['GET', 'POST'])
def password():
    if request.method == 'GET':
        username = request.args.get('username')

        print('username', username)

        # response case code
        # 1 - accepted
        # 2 - server error

        def case1():
            return jsonify({
                'success': True,
                'obscure-email': 'ex*******mail.com',
            })

        def case2():
            return Response(status=500)

        switch = {
            1: case1,
            2: case2,
        }

        return switch[2]()
