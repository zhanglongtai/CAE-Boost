import React from "react"
// import PropTypes from "prop-types"
import Table from "antd/lib/table"
import Divider from "antd/lib/divider"
import Icon from "antd/lib/icon"
import log from "../../../util/log"

// const {ipcRenderer} = window.require("electron")

const columns = [
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
        title: '求解器',
        dataIndex: 'solver',
        key: 'solver',
    },
    {
        title: '任务状态',
        dataIndex: 'state',
        key: 'state',
        render: (text) => {
            switch(text) {
                case 'running':
                    return (
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <div
                                style={{
                                    margin: '0 5px 0 5px',
                                    height: '5px',
                                    width: '5px',
                                    borderRadius: '50%',
                                    backgroundColor: 'green',
                                }}
                            />
                            运行中
                        </div>
                    )
                case 'stopped':
                    return (
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <div
                                style={{
                                    margin: '0 5px 0 5px',
                                    height: '5px',
                                    width: '5px',
                                    borderRadius: '50%',
                                    backgroundColor: 'red',
                                }}
                            />
                            已终止
                        </div>
                    )
                case 'finished':
                    return (
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <div
                                style={{
                                    margin: '0 5px 0 5px',
                                    height: '5px',
                                    width: '5px',
                                    borderRadius: '50%',
                                    backgroundColor: 'blue',
                                }}
                            />
                            已完成
                        </div>
                    )
            }
        },
        filters: [
            { text: '运行中', value: 'running' },
            { text: '已终止', value: 'stopped' },
            { text: '已完成', value: 'finished' },
        ],
    },
    {
        title: '创建时间',
        dataIndex: 'creatTime',
        key: 'creatTime',
    },
    {
        title: '运行时长',
        dataIndex: 'duration',
        key: 'duration',
    },
    {
        title: '操作',
        key: 'action',
        render: (text, item) => {
            switch (item.state) {
                case 'running':
                    return (
                        <span>
                            <a href="#">终止任务</a>
                            <Divider type="vertical" />
                            <a href="#">
                                查看监控 <Icon type="right-circle" />
                            </a>
                        </span>
                    )
                case 'stopped':
                    return (
                        <span>
                            <a href="#">删除任务</a>
                        </span>
                    )
                case 'finished':
                    return (
                        <span>
                            <a href="#">终止任务</a>
                            <Divider type="vertical" />
                            <a href="#">下载任务</a>
                        </span>
                    )
            }
        },
    },
]

const fakeData = [
    {
        key: '1',
        name: 'fluent计算测试',
        id: '6bf9cc22',
        solver: 'Fluent',
        state: 'running',
        creatTime: '2018-02-08 12:00',
        duration: '5.2 hour',
    },
    {
        key: '2',
        name: 'su2计算测试',
        id: '17107d9a',
        solver: 'SU2',
        state: 'stopped',
        creatTime: '2018-02-08 12:00',
        duration: '31.2 hour',
    },
    {
        key: '3',
        name: 'openfoam计算测试',
        id: '2d2a9012',
        solver: 'OpenFoam',
        state: 'finished',
        creatTime: '2018-02-08 12:00',
        duration: '1.2 hour',
    },
]

class TaskList extends React.Component {
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
                className='task-list'
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

// TaskList.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default TaskList
