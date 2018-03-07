import config from "./config"

const getloginAPI = function() {
    return `${config.baseURL}/login`
}

const getRegisterAPI = function() {
    return `${config.baseURL}/register`
}

const getTaskListAPI = function() {
    return `${config.baseURL}/task-list`
}

const getResidualAPI = function() {
    const protocol = config.baseURL.split("/")[0]
    const host = config.baseURL.split("/")[2]
    return `${protocol}//${host}`
}

const getAccountAPI = function() {
    return `${config.baseURL}/account`
}

export {
    getloginAPI,
    getRegisterAPI,
    getTaskListAPI,
    getResidualAPI,
    getAccountAPI,
}
