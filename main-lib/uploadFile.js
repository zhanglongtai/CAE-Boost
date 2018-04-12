const fs = require("fs")
const request = require("request")
const FormData = require("form-data")
const S3Client = require("./s3Client")

// ========== util func ==========
const log = function() {
    console.log.apply(null, arguments)
}
// ========== util func ==========

class UploadFile {
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
        this.uploadList = []
        this.finishedList = []
        this.failList = []
        this.requestList = []

        if (callback !== undefined) {
            this.updateFunc = callback
        } else {
            this.updateFunc = () => {}
        }
    }

    upload(uploadURL, fileName, filePath, fileSize, taskName) {
        const uploadRawHttp = function(self, uploadURL, fileName, filePath, fileSize, taskName) {
            const uuid = `${taskName}-${fileName}`

            let startTime = new Date()
            startTime = startTime.getTime()

            const uploadInstance = {
                uuid: uuid,
                taskName: taskName,
                fileName: fileName,
                filePath: filePath,
                speed: 0,
                chunkSize: { total: 0, uploaded: 0, lastUpdateUploaded: 0 },
                fileSize: fileSize,
                lastUpdateTime: startTime,
                remainingTime: 0,
            }
            self.uploadList.push(uploadInstance)

            const r = request.post(uploadURL, (err, res) => {
                if (err) {
                    log('upload fail', err)
                } else {
                    const removeUploadInstance = function(uuid) {
                        for (let i = 0; i < self.uploadList.length; i++) {
                            if (self.uploadList[i]['uuid'] === uuid) {
                                self.uploadList = self.uploadList.slice(0, i).concat(self.uploadList.slice(i + 1))
                                break
                            }
                        }
                    }

                    const addFinishedInstance = function(taskName, fileName, fileSize) {
                        const finishInstance = {
                            taskName: taskName,
                            fileName: fileName, 
                            fileSize: fileSize,
                            speed: 0,
                        }

                        self.finishedList.push(finishInstance)
                    }

                    removeUploadInstance(uuid)
                    addFinishedInstance(taskName, fileName, fileSize)

                    self.updateFunc({
                        uploadList: self.uploadList,
                        finishedList: self.finishedList,
                    })
                }
            })

            self.requestList.push({
                uuid: uuid,
                requestInstance: r,
            })

            const form = r.form()
            form.append('file', fs.createReadStream(filePath), {
                fileName: fileName,
            })

            // get upload size
            form.getLength((err, size) => {
                if (err) {
                    log(err)
                } else {
                    for (let i = 0; i < self.uploadList.length; i++) {
                        if (self.uploadList[i]['uuid'] === uuid) {
                            self.uploadList[i]['chunkSize']['total'] = size
                        }
                    }
                }
            })

            form.on('data', (data) => {
                const getUploadInstanceIndex = function(uuid) {
                    for (let i = 0; i < self.uploadList.length; i++) {
                        if (self.uploadList[i]['uuid'] === uuid) {
                            return i
                        }
                    }
                }

                const updateUploadInstance = function(index, speed, uploaded, lastUpdateUploaded, lastUpdateTime) {
                    self.uploadList[index]['speed'] = speed
                    self.uploadList[index]['chunkSize']['uploaded'] = uploaded
                    self.uploadList[index]['chunkSize']['lastUpdateUploaded'] = lastUpdateUploaded
                    self.uploadList[index]['lastUpdateTime'] = lastUpdateTime
                }

                const index = getUploadInstanceIndex(uuid)

                const uploaded = self.uploadList[index]['chunkSize']['uploaded']
                const total = self.uploadList[index]['chunkSize']['total']
                const deltaUpload = data.length
                const newUploaded = uploaded + deltaUpload

                const lastUpdateUploaded = self.uploadList[index]['chunkSize']['lastUpdateUploaded']

                let updateTime = new Date()
                updateTime = updateTime.getTime()
                const lastUpdateTime = self.uploadList[index]['lastUpdateTime']
                const deltaTime = updateTime - lastUpdateTime

                // the event is trigged too fast, which lead to renderer page get stucked
                // so enlarge the update interval
                if (deltaTime >= 500) {
                    const deltaUploadedSize = (newUploaded - lastUpdateUploaded) / total * fileSize // B
                    const speed = deltaUploadedSize / (deltaTime) * 1000 // B/s

                    updateUploadInstance(index, speed, newUploaded, newUploaded, updateTime)

                    self.updateFunc({
                        uploadList: self.uploadList,
                        finishedList: self.finishedList,
                    })
                } else {
                    const speed = self.uploadList[index]['speed']

                    updateUploadInstance(index, speed, newUploaded, lastUpdateUploaded, lastUpdateTime)
                }
            })
        }
    
        const uploadS3 = function(self, uploadURL, fileName, filePath, fileSize, taskName) {
            const pushToUploadList = function(uuid) {
                let startTime = new Date()
                startTime = startTime.getTime()

                const uploadInstance = {
                    uuid: uuid,
                    taskName: taskName,
                    fileName: fileName,
                    filePath: filePath,
                    speed: 0,
                    chunkSize: { total: fileSize, uploaded: 0, lastUpdateUploaded: 0 },
                    fileSize: fileSize,
                    lastUpdateTime: startTime,
                    remainingTime: 0,
                }
                self.uploadList.push(uploadInstance)
            }

            const uuid = `${taskName}-${fileName}`
            
            pushToUploadList(uuid)

            const s3 = new S3Client({
                accessKeyId: 'N3Z92X0RX6J4FXQ70JHX',
                secretAccessKey: 'AVdNLrkNdd72uM3XbIvfJ8YAe6lsz5zGrTgk8KuG',
                endpoint: 'http://10.0.0.11:7480 ',
                s3ForcePathStyle: true,
                signatureVersion: 'v2',
            })

            const listener = s3.uploadFile(filePath, fileName, 'upload-test')

            const getKey = function (key) {
                return key
            }

            self.requestList.push({
                [getKey(uuid)]: listener,
            })

            listener.on('upload-error', (err) => {
                log("upload-error", err)

                const removeUploadInstance = function(uuid) {
                    for (let i = 0; i < self.uploadList.length; i++) {
                        if (self.uploadList[i]['uuid'] === uuid) {
                            self.uploadList = self.uploadList.slice(0, i).concat(self.uploadList.slice(i + 1))
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

                removeUploadInstance(uuid)
                addFailInstance(uploadURL, taskName, fileName, filePath, fileSize)
                removeRequestInstance(uuid)

                self.updateFunc({
                    uploadList: self.uploadList,
                    finishedList: self.finishedList,
                    failList: self.failList,
                })
            })

            listener.on('upload-progress', function(args) {
                const getUploadInstanceIndex = function(uuid) {
                    for (let i = 0; i < self.uploadList.length; i++) {
                        if (self.uploadList[i]['uuid'] === uuid) {
                            return i
                        }
                    }
                }

                const updateUploadInstance = function(index, speed, uploaded, lastUpdateUploaded, lastUpdateTime) {
                    self.uploadList[index]['speed'] = speed
                    self.uploadList[index]['chunkSize']['uploaded'] = uploaded
                    self.uploadList[index]['chunkSize']['lastUpdateUploaded'] = lastUpdateUploaded
                    self.uploadList[index]['lastUpdateTime'] = lastUpdateTime
                }

                const index = getUploadInstanceIndex(uuid)

                const total = args.total
                const newUploaded = args.uploaded

                const lastUpdateUploaded = self.uploadList[index]['chunkSize']['lastUpdateUploaded']

                let updateTime = new Date()
                updateTime = updateTime.getTime()
                const lastUpdateTime = self.uploadList[index]['lastUpdateTime']
                const deltaTime = updateTime - lastUpdateTime

                // the event is trigged too fast, which lead to renderer page get stucked
                // so enlarge the update interval
                if (deltaTime >= 500) {
                    const deltaUploadedSize = (newUploaded - lastUpdateUploaded) / total * fileSize // B
                    const speed = deltaUploadedSize / (deltaTime) * 1000 // B/s

                    updateUploadInstance(index, speed, newUploaded, newUploaded, updateTime)

                    self.updateFunc({
                        uploadList: self.uploadList,
                        finishedList: self.finishedList,
                        failList: self.failList,
                    })
                } else {
                    const speed = self.uploadList[index]['speed']

                    updateUploadInstance(index, speed, newUploaded, lastUpdateUploaded, lastUpdateTime)
                }
            })

            listener.on('upload-end', (err) => {
                if (err) {
                    log('upload-end-error', err)
                } else {
                    const removeUploadInstance = function(uuid) {
                        for (let i = 0; i < self.uploadList.length; i++) {
                            if (self.uploadList[i]['uuid'] === uuid) {
                                self.uploadList = self.uploadList.slice(0, i).concat(self.uploadList.slice(i + 1))
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

                    removeUploadInstance(uuid)
                    addFinishedInstance(taskName, fileName, fileSize)
                    removeRequestInstance(uuid)

                    self.updateFunc({
                        uploadList: self.uploadList,
                        finishedList: self.finishedList,
                        failList: self.failList,
                    })
                }
            })
        }

        uploadS3(this, uploadURL, fileName, filePath, fileSize, taskName)
    }

    cancelUpload(fileName, taskName) {
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

module.exports = UploadFile
