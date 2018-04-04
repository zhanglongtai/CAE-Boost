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

        if (callback !== undefined) {
            this.updateFunc = callback
        } else {
            this.updateFunc = () => {}
        }
    }

    upload(uploadURL, fileName, filePath, fileSize, taskName) {
        const that = this

        let startTime = new Date()
        startTime = startTime.getTime()

        const uploadInstance = {
            taskName: taskName,
            fileName: fileName,
            filePath: filePath,
            speed: 0,
            chunkSize: { total: 0, uploaded: 0 },
            fileSize: fileSize,
            lastUpdateTime: startTime,
            remainingTime: 0,
        }
        this.uploadList.push(uploadInstance)

        const r = request.post(uploadURL, (err, res) => {
            if (err) {
                log('upload fail', err)
            } else {
                let fileSize

                const removeUploadInstance = function(filePath) {
                    for (let i = 0; i < that.uploadList.length; i++) {
                        if (that.uploadList[i]['fileName'] === filePath) {
                            fileSize = that.uploadList[i]['fileSize']
                            that.uploadList = that.uploadList.slice(0, i).concat(that.uploadList.slice(i + 1))
                            break
                        }
                    }
                }

                const addFinishedInstance = function(fileName) {
                    const finishInstance = {
                        taskName: taskName,
                        fileName: fileName, 
                        fileSize: fileSize,
                        speed: 0,
                    }

                    that.finishedList.push(finishInstance)
                }

                removeUploadInstance(filePath)
                addFinishedInstance(fileName)

                this.updateFunc({
                    uploadList: this.uploadList,
                    finishedList: this.finishedList,
                })
            }
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
                    if (that.uploadList[i]['filePath'] === filePath) {
                        that.uploadList[i]['chunkSize']['total'] = size
                    }
                }
            }
        })

        form.on('data', (data) => {
            const getUploadInstanceIndex = function(filePath) {
                for (let i = 0; i < that.uploadList.length; i++) {
                    if (that.uploadList[i]['filePath'] === filePath) {
                        return i
                    }
                }
            }

            const updateUploadInstance = function(index, speed, uploaded, lastUpdateTime) {
                that.uploadList[index]['speed'] = speed
                that.uploadList[index]['chunkSize']['uploaded'] = uploaded
                that.uploadList[index]['lastUpdateTime'] = lastUpdateTime
            }

            let updateTime = new Date()
            updateTime = updateTime.getTime()

            const index = getUploadInstanceIndex(filePath)

            const uploaded = this.uploadList[index]['chunkSize']['uploaded']
            const newUploaded = uploaded + data.length

            const lastUpdateTime = this.uploadList[index]['lastUpdateTime']

            const speed = (newUploaded - uploaded) / (updateTime - lastUpdateTime) / 1000 // B/s
            
            updateUploadInstance(index, speed, newUploaded, updateTime)

            this.updateFunc({
                uploadList: this.uploadList,
                finishedList: this.finishedList,
            })
        })
    }
}

module.exports = UploadFile
