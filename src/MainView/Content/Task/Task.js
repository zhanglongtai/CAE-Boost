import React from "react"
// import PropTypes from "prop-types"
import Table from "antd/lib/table"
import Divider from "antd/lib/divider"
import Icon from "antd/lib/icon"

import TaskList from "./TaskList"
import TaskDetail from "./TaskDetail"
import log from "../../../util/log"

// const {ipcRenderer} = window.require("electron")

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

class Task extends React.Component {
    constructor() {
        super()

        this.state = {
            content: 'task-list', // 'task-list', 'task-detail'
            taskID: '',
            taskName: '',
        }

        this.setContent = this.setContent.bind(this)
        this.setTaskDetail = this.setTaskDetail.bind(this)
    }

    componentDidMount() {
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
        const { content, taskID, taskName } = this.state

        const styles = {
            container: {
                minWidth: 1000,
                width: '100%',
                height: 620,
                display: 'flex',
                overflowX: 'hidden',
            },
        }

        return (
            <div
                className='task'
                style={styles.container}
            >
                <TaskList
                    taskList={fakeData}
                    content={content}
                    setContent={this.setContent}
                    setTaskDetail={this.setTaskDetail}
                />
                <TaskDetail
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
