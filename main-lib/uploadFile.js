const fs = require('fs')
const request = require("request")
const FormData = require('form-data')
const s3 = require("s3")

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

    upload(uploadURL, remoteFilePath, fileName, filePath, fileSize, taskName) {
        const that = this

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
                    chunkSize: { total: 0, uploaded: 0, lastUpdateUploaded: 0 },
                    fileSize: fileSize,
                    lastUpdateTime: startTime,
                    remainingTime: 0,
                }
                self.uploadList.push(uploadInstance)
            }

            const uuid = `${taskName}-${fileName}`
            
            pushToUploadList(uuid)

            const client = s3.createClient({
                maxAsyncS3: 20,     // this is the default
                s3RetryCount: 3,    // this is the default
                s3RetryDelay: 1000, // this is the default
                multipartUploadThreshold: 20971520, // this is the default (20 MB)
                multipartUploadSize: 15728640, // this is the default (15 MB)
                s3Options: {
                    accessKeyId: "N3Z92X0RX6J4FXQ70JHX",
                    secretAccessKey: "AVdNLrkNdd72uM3XbIvfJ8YAe6lsz5zGrTgk8KuG",
                    endpoint: 'http://10.0.0.11:7480',
                    s3ForcePathStyle: true,
                },
            })

            const uploader = client.uploadFile({
                localFile: filePath,
                s3Params: {
                    Bucket: "upload-test",
                    Key: fileName,
                },
            })

            const getKey = function (key) {
                return key
            }

            self.requestList.push({
                [getKey(uuid)]: uploader,
            })

            uploader.on('error', (err) => {
                console.error("unable to upload:", err.stack)
            })

            uploader.on('progress', function() {
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

                const total = uploader.progressTotal
                const newUploaded = uploader.progressAmount

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

            uploader.on('end', (err) => {
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

                    const removeRequestInstance = function(uuid) {
                        self.requestList[uuid] = null
                    } 

                    removeUploadInstance(uuid)
                    addFinishedInstance(taskName, fileName, fileSize)
                    removeRequestInstance(uuid)

                    self.updateFunc({
                        uploadList: self.uploadList,
                        finishedList: self.finishedList,
                    })
                }
            })
        }
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
