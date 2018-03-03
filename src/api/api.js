import config from "./config"

const getloginAPI = function() {
    return `${config.baseURL}/login`
}

const getResidualAPI = function() {
    const protocol = config.baseURL.split("/")[0]
    const host = config.baseURL.split("/")[2]
    return `${protocol}//${host}`
}

export {
    getloginAPI,
    getResidualAPI,
}
