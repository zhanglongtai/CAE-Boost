import config from "./config"

let baseURL
if (config.env === 'dev-local') {
    baseURL = config.baseURL
} else if (config.env === 'dev-remote') {
    baseURL = config.remoteBaseURL
}

const getloginAPI = function() {
    if (config.env === 'dev') {
        return config.testLoginURL
    } else {
        return `${baseURL}/login`
    }
}

const getRegisterAPI = function() {
    if (config.env === 'dev') {
        return config.testRegisterURL
    } else {
        return `${baseURL}/register`
    }
}

const getTaskListAPI = function() {
    if (config.env === 'dev') {
        return config.testTaskListURL
    } else {
        return `${baseURL}/task-list`
    }
}

const getTaskAPI = function(taskID) {
    if (config.env === 'dev') {
        return `${config.testTaskURL}/${taskID}`
    } else {
        return `${baseURL}/task/${taskID}`
    }
}

const getSubmitTaskAPI = function() {
    if (config.env === 'dev') {
        return `${config.testSubmitTaskURL}`
    } else {
        return `${baseURL}/task`
    }
}

const getResidualAPI = function() {
    if (config.env === 'dev') {
        return config.testResidualAPI
    } else {
        const protocol = baseURL.split("/")[0]
        const host = baseURL.split("/")[2]
        return `${protocol}//${host}`
    }
}

const getBillAPI = function() {
    if (config.env === 'dev') {
        return config.testBillURL
    } else {
        return `${baseURL}/bill`
    }
}

const getPasswordAPI = function() {
    if (config.env === 'dev') {
        return config.testPasswordURL
    } else {
        return `${baseURL}/password`
    }
}

const getChargeAPI = function(channel) {
    if (config.env === 'dev') {
        return config.testChargeURL
    } else {
        if (channel === 'wx-pay') {
            return `${baseURL}/wxpay_url`
        } else {
            return `${baseURL}/charge`
        }
    }
}

const getCheckPayAPI = function(channel, tradeID) {
    if (config.env === 'dev') {
        return config.testCheckPayURL
    } else {
        if (channel === 'wx-pay') {
            return `${baseURL}/wxpay_check`
        } else {
            return `${baseURL}/charge/${tradeID}`
        }
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
    getSubmitTaskAPI,
}
