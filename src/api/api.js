import config from "./config"

const getJobsAPI = function() {
    return `${config.baseURL}/jobs`
}

const getPartitionsAPI = function() {
    return `${config.baseURL}/partitions`
}

const getRacksAPI = function() {
    return `${config.baseURL}/racks`
}

const getNodesAPI = function() {
    return `${config.baseURL}/nodes`
}

const getQOSAPI = function() {
    return `${config.baseURL}/qos`
}

const getResidualAPI = function() {
    const protocol = config.baseURL.split("/")[0]
    const host = config.baseURL.split("/")[2]
    return `${protocol}//${host}`
}

const getGanntAPI = function() {
    return `${config.baseURL}/gannt`
}

export {
    getJobsAPI,
    getPartitionsAPI,
    getRacksAPI,
    getNodesAPI,
    getQOSAPI,
    getResidualAPI,
    getGanntAPI,
}
