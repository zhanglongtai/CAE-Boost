import React from "react"
import PropTypes from "prop-types"
import Table from "antd/lib/table"
import Divider from "antd/lib/divider"

import log from "../../../util/log"

// const { ipcRenderer } = window.require("electron")

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

const formatListKey = function(list) {
    list.forEach((item, index) => {
        item.key = index
    })
}

class Upload extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {}

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
                width: 100,
                render: (text) => {
                    switch(text) {
                        case 'uploading':
                            return '上传中'
                        case 'stopped':
                            return '已取消'
                        case 'finished':
                            return '已完成'
                        case 'fail':
                            return '上传失败'
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
                width: 100,
            },
            {
                title: '进度',
                dataIndex: 'percent',
                key: 'percent',
                width: 100,
            },
            {
                title: '速度',
                dataIndex: 'speed',
                key: 'speed',
                width: 100,
            },
            {
                title: '操作',
                key: 'action',
                width: 100,
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
                        case 'fail':
                            return (
                                <span><a href="#">重新上传</a></span>
                            )
                    }
                },
            },
        ]

        const { uploadList, failList, finishedList } = this.props

        const listData = uploadList.concat(failList, finishedList)
        formatListKey(listData)

        return (
            <div
                className='upload-container'
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

Upload.propTypes = {
    uploadList: PropTypes.array.isRequired,
    finishedList: PropTypes.array.isRequired,
    failList: PropTypes.array.isRequired,
}

export default Upload
