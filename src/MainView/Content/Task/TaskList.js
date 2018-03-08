import React from "react"
import PropTypes from "prop-types"
import Table from "antd/lib/table"
import Divider from "antd/lib/divider"
import Icon from "antd/lib/icon"

import log from "../../../util/log"

// const {ipcRenderer} = window.require("electron")

class TaskList extends React.Component {
    constructor() {
        super()

        this.state = {
            content: 'task-list', // 'task-list', 'task-detail'
        }

        this.navTaskDetail = this.navTaskDetail.bind(this)
    }

    componentDidMount() {
    }

    navTaskDetail(name, id) {
        this.props.setContent('task-detail')
        this.props.setTaskDetail(name, id)
    }

    render() {
        const {
            content,
            taskList,
            taskContainerWidth,
        } = this.props

        const styles = {
            container: {
                // minWidth: 1000,
                // width: '100%',
                // display: content === 'task-list' ? '' : 'none',
                minWidth: taskContainerWidth,
                minHeight: 620,
                transitionDuration: '0.5s',
                transform: content === 'task-list' ? '' : 'translate(-100%)',
            },
        }

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
                                    <a onClick={() => {this.navTaskDetail(item.name, item.id)}}>
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

        return (
            <div
                className='task-list'
                style={styles.container}
            >
                <Table
                    columns={columns}
                    dataSource={taskList}
                    pagination={false}
                />
            </div>
        )
    }
}

TaskList.propTypes = {
    taskContainerWidth: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    taskList: PropTypes.array.isRequired,
    setContent: PropTypes.func.isRequired,
    setTaskDetail: PropTypes.func.isRequired,
}

export default TaskList
