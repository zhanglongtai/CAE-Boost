from flask import (
    Blueprint,
    request,
    jsonify,
    Response,
)
import time
import json

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


@test_api.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
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
    else:
        data = request.data
        data = json.loads(data)

        print(data)

        return jsonify({
            'success': True,
            'data': {'access_token': 'access_token', 'refresh_token': 'refresh_token'},
        })


@test_api.route('/task-list', methods=['GET'])
def task_list():
    username = request.args.get('username')
    token = request.args.get('token')

    print('username', username)
    print('token', token)

    # response case code
    # 1 - normal list
    # 2 - empty list
    # 3 - server error

    def case1():
        fake_data = [
            {
                'name': 'fluent计算测试',
                'id': '6bf9cc22',
                'solver': 'Fluent',
                'state': 'running',
                'creatTime': '2018-02-08 12:10',
                'duration': '5.2 hour',
            },
            {
                'name': 'su2计算测试',
                'id': '17107d9a',
                'solver': 'SU2',
                'state': 'stopped',
                'creatTime': '2018-02-04 09:37',
                'duration': '31.2 hour',
            },
            {
                'name': 'openfoam计算测试',
                'id': '2d2a9012',
                'solver': 'OpenFoam',
                'state': 'finished',
                'creatTime': '2018-02-06 19:26',
                'duration': '1.2 hour',
            },
        ]

        time.sleep(1)

        return jsonify({
            'TaskList': fake_data,
        })

    def case2():
        return jsonify({'TaskList': []})

    def case3():
        return Response(status=500)

    switch = {
        1: case1,
        2: case2,
        3: case3,
    }

    return switch[1]()


@test_api.route('/task/<string:task_id>')
def task(task_id):
    print('task_id', task_id)

    # response case code
    # 1 - normal task
    # 2 - server error

    def case1():
        fake_data = {
            'task-name': 'fluent计算测试',
            'start': '2018-03-22 12:00',
            'end': '2018-03-22 20:00',
        }

        time.sleep(1)

        return jsonify({
            'Task': fake_data,
        })

    def case2():
        return Response(status=500)

    switch = {
        1: case1,
        2: case2,
    }

    return switch[1]()


@test_api.route('/bill', methods=['GET'])
def bill():
    username = request.args.get('username')
    token = request.args.get('token')

    print('username', username)
    print('token', token)

    # response case code
    # 1 - accepted
    # 2 - server error

    def case1():
        return jsonify({
            'balance': '100.00',
            'voucher': '200.00',
            'charge-record': [
                {'time': '2018-03-22 12:00', 'amount': '100.00', 'channel': 'alipay', 'trade-id': 'd905acb0'},
                {'time': '2018-03-23 14:00', 'amount': '200.00', 'channel': 'wxpay', 'trade-id': 'f27ecb2e'},
                {'time': '2018-03-23 14:00', 'amount': '200.00', 'channel': 'wxpay', 'trade-id': 'f27ecb2e'},
                {'time': '2018-03-23 14:00', 'amount': '200.00', 'channel': 'wxpay', 'trade-id': 'f27ecb2e'},
                {'time': '2018-03-23 14:00', 'amount': '200.00', 'channel': 'wxpay', 'trade-id': 'f27ecb2e'},
            ],
            'consume-record': [
                {'time': '2018-03-22 18:00', 'amount': '100.00', 'task-name': 'Fluent测试', 'task-id': 'd905acb0', 'trade-id': 'd905acb0'},
                {'time': '2018-03-23 14:00', 'amount': '200.00', 'task-name': 'SU2测试', 'task-id': 'f27ecb2e', 'trade-id': 'f27ecb2e'},
                {'time': '2018-03-23 14:00', 'amount': '200.00', 'task-name': 'SU2测试', 'task-id': 'f27ecb2e', 'trade-id': 'f27ecb2e'},
                {'time': '2018-03-23 14:00', 'amount': '200.00', 'task-name': 'SU2测试', 'task-id': 'f27ecb2e', 'trade-id': 'f27ecb2e'},
                {'time': '2018-03-23 14:00', 'amount': '200.00', 'task-name': 'SU2测试', 'task-id': 'f27ecb2e', 'trade-id': 'f27ecb2e'},
            ],
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
        # 2 - username not exist
        # 3 - server error

        def case1():
            return jsonify({
                'success': True,
                'obscure-email': 'ex*******mail.com',
            })

        def case2():
            return jsonify({
                'success': False,
                'error-msg': 'username-not-exist',
            })

        def case3():
            return Response(status=500)

        switch = {
            1: case1,
            2: case2,
            3: case3,
        }

        return switch[2]()
