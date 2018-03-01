import React from "react"
import PropTypes from "prop-types"
import Spin from "antd/lib/spin"
import Icon from "antd/lib/icon"

import { getResidualAPI } from "../../../api"
import log from "../../../util/log"

const io = require("socket.io-client")
const echarts = require("echarts")

class Residual extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isConnectting: true,
            connectedSuccess: false,
            data: {
                isFetching: true,
                success: false,
            },
        }

        this.initChart = this.initChart.bind(this)
        this.connectToServer = this.connectToServer.bind(this)
        this.generateTestChart = this.generateTestChart.bind(this)
    }

    componentDidMount() {
        // this.connectToServer()

        this.generateTestChart()
    }

    componentWillUnmount() {
        if (this.socket !== undefined) {
            this.socket.emit("leave-room", {"task_id": this.props.taskID})
            this.socket.disconnect()
        }

        if (this.residualChart !== undefined) {
            this.residualChart.dispose()
        }
        
        if (this.testChart !== undefined) {
            this.testChart.dispose()
        }
    }

    connectToServer() {
        const {
            taskID,
        } = this.props

        const wsURL = getResidualAPI()
        this.socket = io.connect(wsURL)

        this.socket.on("connect", () => {
            this.setState({
                isConnectting: false,
                connectedSuccess: true,
                data: {
                    isFetching: true,
                    success: false,
                },
            })

            log(`${taskID} connected to server`)
            this.socket.emit("join-room", {"task_id": taskID})
        })

        this.socket.on("disconnect", () => {
            this.setState({
                isConnectting: false,
                connectedSuccess: false,
                data: {
                    isFetching: true,
                    success: false,
                },
            })

            log(`${taskID} disconnected from server`)
        })

        this.socket.on("error", (error) => {
            this.setState({
                isConnectting: false,
                connectedSuccess: false,
                data: {
                    isFetching: true,
                    success: false,
                },
            })

            log(`${taskID} encounters an error : ${error}`)
        })

        this.socket.on("updated-data", (data) => {
            const list = JSON.parse(data)
            log('receive step', list[0].list.length)
            this.setState({
                isConnectting: false,
                connectedSuccess: true,
                data: {
                    isFetching: false,
                    success: true,
                },
            })

            if (this.residualChart === undefined) {
                this.initChart(list)
            } else {
                this.updateChart(list)
            }
        })

        this.socket.on("test-receive-limit-number", (num) => {
            log('receive number', num)
        })
    }

    initChart(data) {
        const residualChartContainer = document.querySelector("#residual")

        const list = data.slice()
        list.shift()
        log(list)

        const series = []
        const legend = { data: [] }
        for (const item of list) {
            const newLine = {
                name: item.name,
                type: "line",
                data: item.list,
                showSymbol: false,
            }
            
            legend.data.push(item.name)
            series.push(newLine)
        }

        const options = {
            title: {
                text: "实时残差数据",
            },
            tooltip: {
                show: false,
            },
            xAxis: {
                // type: "category",
                type: "value",
                scale: true,
            },
            yAxis: {
                type: "value",
                scale: true,
            },
            legend: legend,
            series: series,
        }
        
        this.residualChart = echarts.init(residualChartContainer)
        this.residualChart.setOption(options)
    }

    updateChart(data) {
        const list = data.slice()
        list.shift()
        log(list)

        const newSeries = []
        for (const i in list) {
            newSeries.push({
                data: list[i].list,
            })
        }

        const options = {
            series: newSeries,
        }

        this.residualChart.setOption(options)
    }

    generateTestChart() {
        const initTestChart = function() {
            this.testChart = echarts.init(document.querySelector('#residual'))

            // 指定图表的配置项和数据
            const option = {
                title: {
                    text: 'ECharts 入门示例'
                },
                tooltip: {},
                legend: {
                    data:['销量']
                },
                xAxis: {
                    data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
                },
                yAxis: {},
                series: [{
                    name: '销量',
                    type: 'bar',
                    data: [5, 20, 36, 10, 10, 20]
                }]
            }

            // 使用刚指定的配置项和数据显示图表。
            this.testChart.setOption(option)
        }

        this.setState({
            isConnectting: false,
            connectedSuccess: true,
            data: {
                isFetching: false,
                success: true,
            },
        })

        initTestChart.call(this)
    }

    render() {
        const styles = {
            container: {
                width: '900px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            },
            header: {
                height: '40px',
            },
            content: {
                height: '500px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            },
        }

        const {
            isConnectting,
            connectedSuccess,
            data,
        } = this.state

        const { taskName } = this.props

        let content
        let canvasContainerStyle
        if (isConnectting) {
            const antIcon = <Icon type="loading" style={{ fontSize: 120 }} spin />
            content = (
                <div
                    className="residual-loading"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "500px",
                    }}
                >
                    <Spin indicator={antIcon} />
                    <p style={{marginTop: '100px'}}>正在连接服务器</p>
                </div>
            )

            canvasContainerStyle = { width: "750px", height: "500px", display: 'none' }
        } else {
            if (connectedSuccess) {
                if (data.isFetching) {
                    const antIcon = <Icon type="loading" style={{ fontSize: 120 }} spin />
                    content = (
                        <div
                            className="residual-loading"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "500px",
                            }}
                        >
                            <Spin indicator={antIcon} />
                            <p style={{marginTop: '100px'}}>正在获取数据</p>
                        </div>
                    )

                    canvasContainerStyle = { width: "750px", height: "500px", display: 'none'}
                } else {
                    if (data.success) {
                        content = null
                        canvasContainerStyle = {
                            width: "750px",
                            height: "500px",
                        }
                    } else {
                        const antIcon = <Icon type="error" style={{ fontSize: 120 }} spin />
                        content = (
                            <div
                                className="residual-loading"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                    height: "600px",
                                }}
                            >
                                <Spin indicator={antIcon} />
                                <p style={{marginTop: '100px'}}>暂时无法获取残差数据，请稍后重试。</p>
                            </div>
                        )

                        canvasContainerStyle = { width: "750px", height: "500px", display: 'none'}
                    }
                }
            } else {
                const antIcon = <Icon type="error" style={{ fontSize: 120 }} spin />
                content = (
                    <div
                        className="residual-loading"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "500px",
                        }}
                    >
                        <Spin indicator={antIcon} />
                        <p style={{marginTop: '100px'}}>暂时无法连接到服务器，请稍后重试。</p>
                    </div>
                )

                canvasContainerStyle = { width: "750px", height: "500px", display: 'none'}
            }
        }

        return (
            <div style={styles.container}>
                <div
                    className="residual-title"
                    style={styles.header}
                >
                    <h3>{`${taskName} - 任务残差图`}</h3>
                </div>
                <div style={styles.content}>
                    { content }
                    <div
                        id="residual"
                        style={canvasContainerStyle}
                    ></div>
                </div>
            </div>
        )
    }
}

Residual.propTypes = {
    taskName: PropTypes.string.isRequired,
    taskID: PropTypes.string.isRequired,
}

export default Residual
