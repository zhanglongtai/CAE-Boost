import React from "react"
import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"
import Card from "antd/lib/card"
import Spin from "antd/lib/spin"
import Button from "antd/lib/button"
import Icon from "antd/lib/icon"

import log from "../util/log"
import { getTaskAPI } from "../api"

const { ipcRenderer } = window.require("electron")

class ConsumeDetail extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            task: {
                isFetching: true,
                success: false,
                start: "",
                end: "",
                taskName: "",
                errorMsg: "",
            },
        }

        this.fetchTask = this.fetchTask.bind(this)
    }

    componentDidMount() {
        this.fetchTask()
    }

    fetchTask() {
        this.setState({
            task: {
                isFetching: true,
                success: false,
                start: "",
                end: "",
                taskName: "",
                errorMsg: "",
            },
        })

        const { accessToken, consumeInfo } = this.props

        const url = getTaskAPI(consumeInfo.tradeID)

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}` 
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
                log('result', result)
                const start = result['Task']['start']
                const end = result['Task']['end']
                const taskName = result['Task']['task-name']

                this.setState({
                    task: {
                        isFetching: false,
                        success: true,
                        start: start,
                        end: end,
                        taskName: taskName,
                        errorMsg: '',
                    },
                })
            })
            .catch((error) => {
                log(error)
                if (error.message === 'Failed to fetch') {
                    this.setState({
                        task: {
                            isFetching: false,
                            success: false,
                            start: '',
                            end: '',
                            taskName: '',
                            errorMsg: '网络错误',
                        },
                    })
                } else {
                    this.setState({
                        task: {
                            isFetching: false,
                            success: false,
                            start: '',
                            end: '',
                            taskName: '',
                            errorMsg: error.message,
                        },
                    })
                }
            })
    }

    render() {
        const styles = {
            container: {
                width: 500,
                height: '650px',
                display: "flex",
                flexDirection: 'column',
            },
            itemContainer: {
                width: "400px",
                margin: "20px 0 20px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            },
        }

        const { task } = this.state

        let content = null
        if (task.isFetching) {
            content = (
                <div className="consume-detail-container" style={styles.container}>
                    <div
                        className="consume-loading-container"
                        style={{
                            minWidth: 500,
                            width: "100%",
                            minHeight: 500,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Spin tip="获取数据中..." />
                    </div>
                </div>
            )
        } else {
            if (task.success) {
                const { navToBillList, consumeInfo } = this.props

                content = (
                    <div className='consume-detail-container' style={styles.container}>
                        <div style={{width: 100, height: 30, margin: '20px 0 20px'}}>
                            <Button type="primary" onClick={navToBillList} style={{width: '100px'}}>返回</Button>
                        </div>
                        <Card>
                            <div style={styles.itemContainer}>
                                <p>交易ID:</p>
                                <p>{consumeInfo.tradeID}</p>
                            </div>
                            <div style={styles.itemContainer}>
                                <p>消费金额:</p>
                                <p>{consumeInfo.amount}</p>
                            </div>
                            <div style={styles.itemContainer}>
                                <p>所属任务:</p>
                                <p>{task.taskName}</p>
                            </div>
                            <div style={styles.itemContainer}>
                                <p>任务起始时间:</p>
                                <p>{task.start}</p>
                            </div>
                            <div style={styles.itemContainer}>
                                <p>任务结束时间:</p>
                                <p>{task.end}</p>
                            </div>
                        </Card>
                    </div>
                )
            } else {
                content = (
                    <div className="consume-detail-container" style={styles.container}>
                        <div
                            className="consume-error-msg-container"
                            style={{
                                minWidth: 500,
                                width: "100%",
                                minHeight: 500,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 0 40px 0",
                                }}
                            >
                                <i
                                    className="material-icons"
                                    style={{
                                        fontSize: 40,
                                        margin: "0 10px 0 0",
                                        color: "gray",
                                    }}
                                >error_outline</i>
                                <h3 style={{margin: 0}}>{task.errorMsg}</h3>
                            </div>
                            <Button
                                type="primary"
                                style={{width: "100px"}}
                                onClick={this.fetchTask}
                            >点击重试</Button>
                        </div>
                    </div>
                )
            }
        }

        return content
    }
}

ConsumeDetail.propTypes = {
    consumeInfo: PropTypes.object.isRequired,
    accessToken: PropTypes.string.isRequired,
    navToBillList: PropTypes.func.isRequired,
}

export default ConsumeDetail
