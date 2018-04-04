import React from "react"
// import PropTypes from "prop-types"
import Table from "antd/lib/table"
import Divider from "antd/lib/divider"

import log from "../../../util/log"

const { ipcRenderer } = window.require("electron")

const fakeData = [
    {
        key: '1',
        fileName: 'test.cas',
        state: 'uploading',
        taskName: 'fluent计算测试',
        id: '6bf9cc22',
        size: '200.0 MB',
        percent: '23.5%',
        speed: '560.8 K/s',
    },
    {
        key: '2',
        fileName: 'test.dat',
        state: 'uploading',
        taskName: 'fluent计算测试',
        id: '6bf9cc22',
        size: '100.0 MB',
        percent: '30.2%',
        speed: '805.2 K/s',
    },
]

const formattedUploadList = function(list) {
    return list.map((item, index) => {
        const formattedSize = function(fileSize) {
            let size = fileSize
            let unit = "B"
            if (size >= 1024*1024) {
                size = Math.round(size / 1024 / 1024)
                unit = "MB"
            } else if (size >= 1024){
                unit = "KB"
                size = Math.round(size / 1024)
            } else {
                size = Math.round(size)
            }

            return `${size} ${unit}`
        }

        const key = index
        const fileName = item.fileName
        const state = 'uploading'
        const taskName = item.taskName
        
        let percent
        if (item.chunkSize.total !==0 ) {
            percent = (item.chunkSize.uploaded / item.chunkSize.total * 100).toFixed(1)
        } else {
            percent = '-'
        }

        const speed = item.speed
        const size = formattedSize(item.fileSize)

        return {
            key: key,
            fileName: fileName,
            state: state,
            taskName: taskName,
            percent: percent,
            speed: speed,
            size: size,
        }
    })
}

const formattedFinishedList = function(list) {
    return list.map((item, index) => {
        const formattedSize = function(fileSize) {
            let size = fileSize
            let unit = "B"
            if (size >= 1024*1024) {
                size = Math.round(size / 1024 / 1024)
                unit = "MB"
            } else if (size >= 1024){
                unit = "KB"
                size = Math.round(size / 1024)
            } else {
                size = Math.round(size)
            }

            return `${size} ${unit}`
        }

        const key = index
        const fileName = item.fileName
        const state = 'finished'
        const taskName = item.taskName
        const percent = '-'
        const speed = '-'
        const size = formattedSize(item.fileSize)

        return {
            key: key,
            fileName: fileName,
            state: state,
            taskName: taskName,
            percent: percent,
            speed: speed,
            size: size,
        }
    })
}

class Upload extends React.Component {
    constructor() {
        super()

        this.state = {
            uploadList: [],
            finishedList: [],
        }
    }

    componentDidMount() {
        ipcRenderer.on('update-upload-file', (event, args) => {
            log('receive-allfile', args)
            const uploadList = formattedUploadList(args.uploadList)
            const finishedList = formattedFinishedList(args.finishedList)

            this.setState({
                uploadList: uploadList,
                finishedList: finishedList,
            })
        })
    }

    render() {
        const styles = {
            container: {
                minWidth: 1000,
                width: '100%',
                height: 620,
            },
        }

        const columns = [
            {
                title: '文件名称',
                dataIndex: 'fileName',
                key: 'fileName',
            },
            {
                title: '状态',
                dataIndex: 'state',
                key: 'state',
                render: (text) => {
                    switch(text) {
                        case 'uploading':
                            return (
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    上传中
                                </div>
                            )
                        case 'stopped':
                            return (
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    已取消
                                </div>
                            )
                        case 'finished':
                            return (
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    已完成
                                </div>
                            )
                    }
                },
            },
            {
                title: '任务名称',
                dataIndex: 'taskName',
                key: 'taskName',
            },
            {
                title: '文件大小',
                dataIndex: 'size',
                key: 'size',
            },
            {
                title: '进度',
                dataIndex: 'percent',
                key: 'percent',
            },
            {
                title: '速度',
                dataIndex: 'speed',
                key: 'speed',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, item) => {
                    switch (item.state) {
                        case 'uploading':
                            return (
                                <span>
                                    <a href="#">取消上传</a>
                                </span>
                            )
                        case 'stopped':
                            return null
                        case 'finished':
                            return (
                                <span>
                                    <a href="#">删除文件</a>
                                </span>
                            )
                    }
                },
            },
        ]

        const { uploadList, finishedList } = this.state

        const listData = uploadList.concat(finishedList)

        return (
            <div
                className='upload'
                style={styles.container}
            >
                <Table
                    columns={columns}
                    dataSource={listData}
                    pagination={false}
                />
            </div>
        )
    }
}

// Upload.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default Upload
