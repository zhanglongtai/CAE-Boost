const config = {
    env: 'dev-remote',
    // env: 'dev-local',
    // env: 'dev',
    baseURL: 'http://127.0.0.1:3000/api',
    remoteBaseURL: 'http://193.112.189.245:2000/api',
    testLoginURL: 'http://10.0.0.18:8000/login',
    testPasswordURL: 'http://10.0.0.18:8000/password',
    testRegisterURL: 'http://10.0.0.18:8000/register',
    testTaskListURL: 'http://10.0.0.18:8000/tasks',
    testTaskURL: 'http://10.0.0.18:8000/task',
    testSubmitTaskURL: 'http://10.0.0.18:8000/task',
    testBillURL: 'http://10.0.0.18:9000/account',
    testChargeURL: 'http://10.0.0.18:9000/charge',
    testResidualAPI: 'http://10.0.0.18:8080/task',
}

export default config
