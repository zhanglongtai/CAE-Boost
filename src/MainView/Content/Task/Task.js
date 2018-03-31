import React from "react"
// import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"
import Table from "antd/lib/table"
import Divider from "antd/lib/divider"
import Icon from "antd/lib/icon"
import Spin from "antd/lib/spin"
import Button from "antd/lib/button"

import TaskList from "./TaskList"
import TaskDetail from "./TaskDetail"
import { getTaskListAPI } from "../../../api"
import log from "../../../util/log"

const { ipcRenderer } = window.require("electron")

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

const formattedData = function(list) {
    return list.map((item, index) => {
        return {
            key: `${index + 1}`,
            name: item['name'],
            id: item['id'],
            solver: item['solver'],
            state: item['state'],
            creatTime: item['creatTime'],
            duration: item['duration'],
        }
    })
}

class Task extends React.Component {
    constructor() {
        super()

        this.state = {
            content: 'task-list', // 'task-list', 'task-detail'
            taskList: {
                isFetching: true,
                success: false,
                list: [],
                errorMsg: '',
            },
            taskContainerWidth: 1000,
            accessToken: '',
            taskID: '',
            taskName: '',
        }

        this.setContent = this.setContent.bind(this)
        this.setTaskDetail = this.setTaskDetail.bind(this)
        this.fetchTaskList = this.fetchTaskList.bind(this)
    }

    componentDidMount() {
        ipcRenderer.on('user-info', (event, args) => {
            const { accessToken } = args
            this.setState({
                accessToken: accessToken,
            }, () => {
                this.fetchTaskList()
            })
        })

        window.addEventListener('resize', () => {
            const taskContainer = document.querySelector('.task')
            if (taskContainer !== null) {
                this.setState({
                    taskContainerWidth: taskContainer.clientWidth,
                })
            }
        })
    }

    fetchTaskList() {
        this.setState({
            taskList: {
                isFetching: true,
                success: false,
                list: [],
                errorMsg: '',
            },
        })

        const { accessToken } = this.state
        const url = `${getTaskListAPI()}`

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response
                } else {
                    if (response.status >= 400 && response.status < 500) {
                        const error = new Error('暂时无法连接服务器')
                        error.response = response
                        throw error
                    } else if (response.status >= 500 ) {
                        const error = new Error('服务器错误')
                        error.response = response
                        throw error
                    } else {
                        const error = new Error(response.statusText)
                        error.response = response
                        throw error
                    }
                }
            })
            .then((response) => {
                return response.json()
            })
            .then((result) => {
                if (result['success']) {
                    const list = result['data']
                    const newList = formattedData(list)
                    this.setState({
                        taskList: {
                            isFetching: false,
                            success: true,
                            list: newList,
                            errorMsg: '',
                        },
                    })
                }
            })
            .catch((error) => {
                log(error)
                if (error.message === 'Failed to fetch') {
                    this.setState({
                        taskList: {
                            isFetching: false,
                            success: false,
                            list: [],
                            errorMsg: '网络错误',
                        },
                    })
                } else {
                    this.setState({
                        taskList: {
                            isFetching: false,
                            success: false,
                            list: [],
                            errorMsg: error.message,
                        },
                    })
                }
            })
    }

    setContent(content) {
        this.setState({
            content: content,
        })
    }

    setTaskDetail(name, id) {
        this.setState({
            taskID: id,
            taskName: name,
        })
    }

    render() {
        const { content, taskID, taskName, taskList, taskContainerWidth } = this.state

        const styles = {
            container: {
                flexGrow: 1,
                minWidth: 1000,
                width: '100%',
                minHeight: 620,
                display: 'flex',
                overflowX: 'hidden',
            },
        }

        let taskListContent = null
        if (taskList.isFetching) {
            taskListContent = (
                <div
                    className="task-list-loading-container"
                    style={{
                        // minWidth: 1000,
                        // width: '100%',
                        minWidth: taskContainerWidth,
                        minHeight: 620,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Spin tip="获取数据中..." />
                </div>
            )
        } else {
            if (taskList.success) {
                if (taskList.list.length === 0) {
                    taskListContent = (
                        <div
                            className="task-list-empty-container"
                            style={{
                                // minWidth: 1000,
                                // width: '100%',
                                minWidth: taskContainerWidth,
                                minHeight: 620,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <img
                                src="img/empty-state.png"
                                style={{
                                    width: '573px',
                                    height: '263px',
                                }}
                            />
                            <h2>目前还未创建任务</h2>
                        </div>
                    )
                } else {
                    taskListContent = <TaskList
                        taskContainerWidth={taskContainerWidth}
                        taskList={taskList.list}
                        content={content}
                        setContent={this.setContent}
                        setTaskDetail={this.setTaskDetail}
                    />
                }
            } else {
                taskListContent = (
                    <div
                        style={{
                            // minWidth: 1000,
                            // width: '100%',
                            minWidth: taskContainerWidth,
                            minHeight: 620,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        className='task-list-error'
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 0 40px 0',
                            }}
                        >
                            <i
                                className="material-icons"
                                style={{
                                    fontSize: 40,
                                    margin: '0 10px 0 0',
                                    color: 'gray',
                                }}
                            >error_outline</i>
                            <h3 style={{margin: 0}}>{taskList.errorMsg}</h3>
                        </div>
                        <Button
                            type="primary"
                            style={{width: '30%'}}
                            onClick={this.fetchTaskList}
                        >点击重试</Button>
                    </div>
                )
            }
        }

        return (
            <div
                className='task'
                style={styles.container}
            >
                {/* <TaskList
                    taskList={fakeData}
                    content={content}
                    setContent={this.setContent}
                    setTaskDetail={this.setTaskDetail}
                /> */}
                { taskListContent }
                <TaskDetail
                    taskContainerWidth={taskContainerWidth}
                    setContent={this.setContent}
                    content={content}
                    taskName={taskName}
                    taskID={taskID}
                />
            </div>
        )
    }
}

// Task.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default Task
