const fs = require("fs")
const S3Client = require("./s3Client")

// ========== util func ==========
const log = function() {
    console.log.apply(null, arguments)
}
// ========== util func ==========

class DownloadFile {
    constructor(callback) {
        /*
            uuid: '',
            taskID: '',
            fileName: fileName,
            filePath: filePath,
            speed: 0,
            chunkSize: { total: 0, downloaded: 0, lastUpdateDownloaded: 0 },
            fileSize: fileSize,
            lastUpdateTime: startTime,
        */
        this.downloadList = []
        this.finishedList = []
        this.failList = []
        this.requestList = []

        if (callback !== undefined) {
            this.updateFunc = callback
        } else {
            this.updateFunc = () => {}
        }
    }

    downLoad(downloadURL, fileName, filePath, fileSize, taskID) {
        const downloadS3 = function(self, downloadURL, fileName, filePath, fileSize, taskID) {
            const uuid = `${taskID}-${fileName}`

            const pushToDownloadList = function() {
                let startTime = new Date()
                startTime = startTime.getTime()

                const downloadInstance = {
                    uuid: uuid,
                    taskID: taskID,
                    fileName: fileName,
                    filePath: filePath,
                    speed: 0,
                    chunkSize: { total: fileSize, downLoaded: 0, lastUpdateDownloaded: 0 },
                    fileSize: fileSize,
                    lastUpdateTime: startTime,
                    remainingTime: 0,
                }
                self.downloadList.push(downloadInstance)
            }

            pushToDownloadList()

            const s3 = new S3Client({
                accessKeyId: 'N3Z92X0RX6J4FXQ70JHX',
                secretAccessKey: 'AVdNLrkNdd72uM3XbIvfJ8YAe6lsz5zGrTgk8KuG',
                endpoint: 'http://10.0.0.11:7480 ',
                s3ForcePathStyle: true,
            })

            const listener = s3.downloadFile(filePath, fileName, 'upload-test')

            const getKey = function (key) {
                return key
            }

            self.requestList.push({
                [getKey(uuid)]: listener,
            })

            listener.on('download-progress', (args) => {
                const getDownloadInstanceIndex = function(uuid) {
                    for (let i = 0; i < self.downloadList.length; i++) {
                        if (self.downloadList[i]['uuid'] === uuid) {
                            return i
                        }
                    }
                }

                const updateDownloadInstance = function(index, speed, downloaded, lastUpdateUploaded, lastUpdateTime) {
                    self.downloadList[index]['speed'] = speed
                    self.downloadList[index]['chunkSize']['downloaded'] = downloaded
                    self.downloadList[index]['chunkSize']['lastUpdateDownloaded'] = lastUpdateUploaded
                    self.downloadList[index]['lastUpdateTime'] = lastUpdateTime
                }

                const index = getDownloadInstanceIndex(uuid)

                const total = args.total
                const newDownloaded = args.downloaded

                const lastUpdateDownloaded = self.downloadList[index]['chunkSize']['lastUpdateDownloaded']

                let updateTime = new Date()
                updateTime = updateTime.getTime()
                const lastUpdateTime = self.downloadList[index]['lastUpdateTime']
                const deltaTime = updateTime - lastUpdateTime

                // the event is trigged too fast, which lead to renderer page get stucked
                // so enlarge the update interval
                if (deltaTime >= 500) {
                    const deltaUploadedSize = (newDownloaded - lastUpdateDownloaded) / total * fileSize // B
                    const speed = deltaUploadedSize / (deltaTime) * 1000 // B/s

                    updateDownloadInstance(index, speed, newDownloaded, newDownloaded, updateTime)

                    self.updateFunc({
                        downloadList: self.downloadList,
                        finishedList: self.finishedList,
                        failList: self.failList,
                    })
                } else {
                    const speed = self.downloadList[index]['speed']

                    updateDownloadInstance(index, speed, newDownloaded, lastUpdateDownloaded, lastUpdateTime)
                }
            })

            listener.on('download-end', () => {
                const removeDownloadInstance = function(uuid) {
                    for (let i = 0; i < self.downloadList.length; i++) {
                        if (self.downloadList[i]['uuid'] === uuid) {
                            self.downloadList = self.downloadList.slice(0, i).concat(self.downloadList.slice(i + 1))
                            break
                        }
                    }
                }

                const addFinishedInstance = function(taskID, fileName, fileSize) {
                    const finishInstance = {
                        taskID: taskID,
                        fileName: fileName, 
                        fileSize: fileSize,
                    }

                    self.finishedList.push(finishInstance)
                }

                const removeRequestInstance = function(uuid) {
                    self.requestList[uuid] = null
                }

                removeDownloadInstance(uuid)
                addFinishedInstance(taskID, fileName, fileSize)
                removeRequestInstance(uuid)

                self.updateFunc({
                    downloadList: self.downloadList,
                    finishedList: self.finishedList,
                    failList: self.failList,
                })
            })

            listener.on('download-error', (err) => {
                log("download-error", err)

                const removeDownloadInstance = function(uuid) {
                    for (let i = 0; i < self.downloadList.length; i++) {
                        if (self.downloadList[i]['uuid'] === uuid) {
                            self.downloadList = self.downloadList.slice(0, i).concat(self.downloadList.slice(i + 1))
                            break
                        }
                    }
                }

                const addFailInstance = function(downloadURL, taskID, fileName, filePath, fileSize) {
                    const failInstance = {
                        downloadURL: downloadURL,
                        taskID: taskID,
                        fileName: fileName, 
                        fileSize: fileSize,
                        filePath: filePath,
                    }

                    self.finishedList.push(failInstance)
                }
                
                const removeRequestInstance = function(uuid) {
                    self.requestList[uuid] = null
                }

                removeDownloadInstance(uuid)
                addFailInstance(downloadURL, taskID, fileName, filePath, fileSize)
                removeRequestInstance(uuid)

                self.updateFunc({
                    downloadList: self.downloadList,
                    finishedList: self.finishedList,
                    failList: self.failList,
                })
            })
        }

        downloadS3(this, downloadURL, fileName, filePath, fileSize, taskID)
    }

    cancelDownload(fileName, taskID) {
        const that = this

        const getRequestInstanceIndex = function(uuid) {
            for (let i = 0; i < that.requestList.length; i++) {
                if (that.requestList[i]['uuid'] === uuid) {
                    return i
                }
            }
        }
        
        const uuid = `${taskID}-${fileName}`

        const index = getRequestInstanceIndex(uuid)

        that.requestList[index].requestInstance.abort()
    }
}

module.exports = DownloadFile
