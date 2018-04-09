const fs = require('fs')
const request = require("request")
const FormData = require('form-data')

// ========== util func ==========
const log = function() {
    console.log.apply(null, arguments)
}
// ========== util func ==========

class UploadFile {
    constructor(callback) {
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
        const that = this

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
        this.uploadList.push(uploadInstance)

        const r = request.post(uploadURL, (err, res) => {
            if (err) {
                log('upload fail', err)
            } else {
                const removeUploadInstance = function(uuid) {
                    for (let i = 0; i < that.uploadList.length; i++) {
                        if (that.uploadList[i]['uuid'] === uuid) {
                            that.uploadList = that.uploadList.slice(0, i).concat(that.uploadList.slice(i + 1))
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

                    that.finishedList.push(finishInstance)
                }

                removeUploadInstance(uuid)
                addFinishedInstance(taskName, fileName, fileSize)

                this.updateFunc({
                    uploadList: this.uploadList,
                    finishedList: this.finishedList,
                })
            }
        })

        this.requestList.push({
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
                for (let i = 0; i < that.uploadList.length; i++) {
                    if (that.uploadList[i]['uuid'] === uuid) {
                        that.uploadList[i]['chunkSize']['total'] = size
                    }
                }
            }
        })

        form.on('data', (data) => {
            const getUploadInstanceIndex = function(uuid) {
                for (let i = 0; i < that.uploadList.length; i++) {
                    if (that.uploadList[i]['uuid'] === uuid) {
                        return i
                    }
                }
            }

            const updateUploadInstance = function(index, speed, uploaded, lastUpdateUploaded, lastUpdateTime) {
                that.uploadList[index]['speed'] = speed
                that.uploadList[index]['chunkSize']['uploaded'] = uploaded
                that.uploadList[index]['chunkSize']['lastUpdateUploaded'] = lastUpdateUploaded
                that.uploadList[index]['lastUpdateTime'] = lastUpdateTime
            }

            const index = getUploadInstanceIndex(uuid)

            const uploaded = this.uploadList[index]['chunkSize']['uploaded']
            const total = this.uploadList[index]['chunkSize']['total']
            const deltaUpload = data.length
            const newUploaded = uploaded + deltaUpload

            const lastUpdateUploaded = this.uploadList[index]['chunkSize']['lastUpdateUploaded']

            let updateTime = new Date()
            updateTime = updateTime.getTime()
            const lastUpdateTime = this.uploadList[index]['lastUpdateTime']
            const deltaTime = updateTime - lastUpdateTime

            

            // the event is trigged too fast, which lead to renderer page get stucked
            // so enlarge the update interval
            if (deltaTime >= 500) {
                const deltaUploadedSize = (newUploaded - lastUpdateUploaded) / total * fileSize // B
                const speed = deltaUploadedSize / (deltaTime) * 1000 // B/s

                updateUploadInstance(index, speed, newUploaded, newUploaded, updateTime)

                this.updateFunc({
                    uploadList: this.uploadList,
                    finishedList: this.finishedList,
                })
            } else {
                const speed = this.uploadList[index]['speed']

                updateUploadInstance(index, speed, newUploaded, lastUpdateUploaded, lastUpdateTime)
            }
        })
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
