import React from "react"
// import PropTypes from "prop-types"
import Table from "antd/lib/table"
import Divider from "antd/lib/divider"

import log from "../../../util/log"

// const {ipcRenderer} = window.require("electron")

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
        title: '任务ID',
        dataIndex: 'id',
        key: 'id',
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

const fakeData = [
    {
        key: '1',
        fileName: 'test.cas',
        state: 'uploading',
        taskName: 'fluent计算测试',
        id: '6bf9cc22',
        percent: '23.5%',
        speed: '560.8 K/s',
    },
    {
        key: '2',
        fileName: 'test.dat',
        state: 'uploading',
        taskName: 'fluent计算测试',
        id: '6bf9cc22',
        percent: '30.2%',
        speed: '805.2 K/s',
    },
]

class Upload extends React.Component {
    constructor() {
        super()
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

        return (
            <div
                className='upload'
                style={styles.container}
            >
                <Table
                    columns={columns}
                    dataSource={fakeData}
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
