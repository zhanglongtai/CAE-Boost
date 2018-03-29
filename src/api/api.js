import config from "./config"

const getloginAPI = function() {
    if (config.env === 'dev') {
        return config.testLoginURL
    } else {
        return `${config.baseURL}/login`
    }
}

const getRegisterAPI = function() {
    if (config.env === 'dev') {
        return config.testRegisterURL
    } else {
        return `${config.baseURL}/register`
    }
}

const getTaskListAPI = function() {
    if (config.env === 'dev') {
        return config.testTaskListURL
    } else {
        return `${config.baseURL}/task-list`
    }
}

const getTaskAPI = function(taskID) {
    if (config.env === 'dev') {
        return `${config.testTaskURL}/${taskID}`
    } else {
        return `${config.baseURL}/task/${taskID}`
    }
}

const getResidualAPI = function() {
    const protocol = config.baseURL.split("/")[0]
    const host = config.baseURL.split("/")[2]
    return `${protocol}//${host}`
}

const getBillAPI = function() {
    if (config.env === 'dev') {
        return config.testBillURL
    } else {
        return `${config.baseURL}/bill`
    }
}

const getPasswordAPI = function() {
    if (config.env === 'dev') {
        return config.testPasswordURL
    } else {
        return `${config.baseURL}/password`
    }
}

const getChargeAPI = function() {
    if (config.env === 'dev') {
        return config.testChargeURL
    } else {
        return `${config.baseURL}/charge`
    }
}

const getCheckPayAPI = function(tradeID) {
    if (config.env === 'dev') {
        return config.testCheckPayURL
    } else {
        return `${config.baseURL}/charge/${tradeID}`
    }
}

export {
    getloginAPI,
    getRegisterAPI,
    getTaskListAPI,
    getResidualAPI,
    getBillAPI,
    getPasswordAPI,
    getTaskAPI,
    getChargeAPI,
    getCheckPayAPI,
}
