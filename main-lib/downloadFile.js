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
            taskName: '',
            fileName: fileName,
            filePath: filePath,
            speed: 0,
            chunkSize: { total: 0, uploaded: 0, lastUpdateUploaded: 0 },
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

    downLoad(uploadURL, fileName, filePath, fileSize, taskName) {
        const downloadS3 = function(self, uploadURL, fileName, filePath, fileSize, taskName) {
            const uuid = `${taskName}-${fileName}`

            const pushToDownloadList = function() {
                let startTime = new Date()
                startTime = startTime.getTime()

                const downloadInstance = {
                    uuid: uuid,
                    taskName: taskName,
                    fileName: fileName,
                    filePath: filePath,
                    speed: 0,
                    chunkSize: { total: fileSize, downLoaded: 0, lastUpdateDownloaded: 0 },
                    fileSize: fileSize,
                    lastUpdateTime: startTime,
                    remainingTime: 0,
                }
                self.uploadList.push(downloadInstance)
            }

            pushToDownloadList()

            const s3 = new S3Client({
                accessKeyId: 'N3Z92X0RX6J4FXQ70JHX',
                secretAccessKey: 'AVdNLrkNdd72uM3XbIvfJ8YAe6lsz5zGrTgk8KuG',
                endpoint: 'http://10.0.0.11:7480 ',
                s3ForcePathStyle: true,
            })

            const listener = s3.getObject(filePath, fileName, 'upload-test')

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

                const updateDownloadInstance = function(index, speed, uploaded, lastUpdateUploaded, lastUpdateTime) {
                    self.uploadList[index]['speed'] = speed
                    self.uploadList[index]['chunkSize']['downloaded'] = uploaded
                    self.uploadList[index]['chunkSize']['lastUpdateDownloaded'] = lastUpdateUploaded
                    self.uploadList[index]['lastUpdateTime'] = lastUpdateTime
                }

                const index = getDownloadInstanceIndex(uuid)

                const total = args.total
                const newDownloaded = args.downloaded

                const lastUpdateDownloaded = self.downloadList[index]['chunkSize']['lastUpdateDownloaded']

                let updateTime = new Date()
                updateTime = updateTime.getTime()
                const lastUpdateTime = self.uploadList[index]['lastUpdateTime']
                const deltaTime = updateTime - lastUpdateTime

                // the event is trigged too fast, which lead to renderer page get stucked
                // so enlarge the update interval
                if (deltaTime >= 500) {
                    const deltaUploadedSize = (newDownloaded - lastUpdateDownloaded) / total * fileSize // B
                    const speed = deltaUploadedSize / (deltaTime) * 1000 // B/s

                    updateDownloadInstance(index, speed, newDownloaded, newDownloaded, updateTime)

                    self.updateFunc({
                        uploadList: self.uploadList,
                        finishedList: self.finishedList,
                        failList: self.failList,
                    })
                } else {
                    const speed = self.uploadList[index]['speed']

                    updateDownloadInstance(index, speed, newDownloaded, lastUpdateDownloaded, lastUpdateTime)
                }
            })

            listener.on('upload-end', () => {
                const removeDownloadInstance = function(uuid) {
                    for (let i = 0; i < self.downloadList.length; i++) {
                        if (self.downloadList[i]['uuid'] === uuid) {
                            self.downloadList = self.downloadList.slice(0, i).concat(self.downloadList.slice(i + 1))
                            break
                        }
                    }
                }

                const addFinishedInstance = function(taskName, fileName, fileSize) {
                    const finishInstance = {
                        taskName: taskName,
                        fileName: fileName, 
                        fileSize: fileSize,
                    }

                    self.finishedList.push(finishInstance)
                }

                const removeRequestInstance = function(uuid) {
                    self.requestList[uuid] = null
                }

                removeDownloadInstance(uuid)
                addFinishedInstance(taskName, fileName, fileSize)
                removeRequestInstance(uuid)

                self.updateFunc({
                    uploadList: self.uploadList,
                    finishedList: self.finishedList,
                    failList: self.failList,
                })
            })

            listener.on('upload-error', (err) => {
                log("upload-error", err)

                const removeDownloadInstance = function(uuid) {
                    for (let i = 0; i < self.downloadList.length; i++) {
                        if (self.downloadList[i]['uuid'] === uuid) {
                            self.downloadList = self.downloadList.slice(0, i).concat(self.downloadList.slice(i + 1))
                            break
                        }
                    }
                }

                const addFailInstance = function(uploadURL, taskName, fileName, filePath, fileSize) {
                    const failInstance = {
                        uploadURL: uploadURL,
                        taskName: taskName,
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
                addFailInstance(uploadURL, taskName, fileName, filePath, fileSize)
                removeRequestInstance(uuid)

                self.updateFunc({
                    uploadList: self.uploadList,
                    finishedList: self.finishedList,
                    failList: self.failList,
                })
            })
        }

        downloadS3(this, uploadURL, fileName, filePath, fileSize, taskName)
    }

    cancelDownload(fileName, taskName) {
        const that = this

        const getRequestInstanceIndex = function(uuid) {
            for (let i = 0; i < that.requestList.length; i++) {
                if (that.requestList[i]['uuid'] === uuid) {
                    return i
                }
            }
        }
        
        const uuid = `${taskName}-${fileName}`

        const index = getRequestInstanceIndex(uuid)

        that.requestList[index].requestInstance.abort()
    }
}

module.exports = DownloadFile
