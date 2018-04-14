const S3Client = require("./s3Client")

// ========== util func ==========
const log = function() {
    console.log.apply(null, arguments)
}
// ========== util func ==========

class GetTaskFileList {
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

    list(bucketName) {
        const that = this

        const s3 = new S3Client({
            accessKeyId: 'N3Z92X0RX6J4FXQ70JHX',
            secretAccessKey: 'AVdNLrkNdd72uM3XbIvfJ8YAe6lsz5zGrTgk8KuG',
            endpoint: 'http://10.0.0.11:7480 ',
            s3ForcePathStyle: true,
        })

        const params = {
            Bucket: bucketName,
        }

        s3.client.listObjects(params, (err, data) => {
            if (err) {
                log('list objects err', err)
                
                that.updateFunc(false, [], err.code)
            } else {
                const list = data['Contents'].map((item) => {
                    const fileName = item['Key']
                    const fileSize = item['Size']

                    return {
                        fileName: fileName,
                        fileSize: fileSize, 
                    }
                })

                that.updateFunc(true, list, '')
            }
        })
    }
}

module.exports = GetTaskFileList
