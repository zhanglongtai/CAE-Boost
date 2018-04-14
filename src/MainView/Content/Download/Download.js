import React from "react"
import PropTypes from "prop-types"
import Table from "antd/lib/table"

import log from "../../../util/log"

// const {ipcRenderer} = window.require("electron")

const fakeData = [
    {
        key: '1',
        state: 'downloading',
        name: 'fluent计算测试',
        id: '6bf9cc22',
        percent: '23.5%',
        speed: '560.8 K/s',
    },
]

const formatListKey = function(list) {
    list.forEach((item, index) => {
        item.key = index
    })
}

class Download extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
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
                title: '文件名',
                dataIndex: 'fileName',
                key: 'fileName',
            },
            {
                title: '文件大小',
                dataIndex: 'size',
                key: 'size',
                width: 100,
            },
            {
                title: '状态',
                dataIndex: 'state',
                key: 'state',
                width: 100,
                render: (text) => {
                    switch(text) {
                        case 'downloading':
                            return '下载中'
                        case 'stopped':
                            return '已取消'
                        case 'finished':
                            return '已完成'
                        case 'fail':
                            return '下载失败'
                    }
                },
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
                        case 'downloading':
                            return (
                                <span><a href="#">取消下载</a></span>
                            )
                        case 'stopped':
                            return null
                        case 'finished':
                            return '-'
                        case 'fail':
                            return (
                                <span><a href="#">重新上传</a></span>
                            )
                    }
                },
            },
        ]

        const { downloadList, failList, finishedList } = this.props

        const listData = downloadList.concat(failList, finishedList)
        formatListKey(listData)

        return (
            <div
                className='download-container'
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

Download.propTypes = {
    downloadList: PropTypes.array.isRequired,
    finishedList: PropTypes.array.isRequired,
    failList: PropTypes.array.isRequired,
}

export default Download
