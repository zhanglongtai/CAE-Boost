import React from "react"
// import PropTypes from "prop-types"
import Table from "antd/lib/table"
import Divider from "antd/lib/divider"

import log from "../../../util/log"

// const {ipcRenderer} = window.require("electron")

const columns = [
    {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        render: (text) => {
            switch(text) {
                case 'downloading':
                    return (
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            下载中
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
        dataIndex: 'name',
        key: 'name',
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
                case 'downloading':
                    return (
                        <span>
                            <a href="#">取消下载</a>
                        </span>
                    )
                case 'stopped':
                    return null
                case 'finished':
                    return null
            }
        },
    },
]

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

class Download extends React.Component {
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
                className='download'
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

// Download.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default Download
