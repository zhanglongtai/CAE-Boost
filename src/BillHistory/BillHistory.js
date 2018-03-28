import React from "react"
import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"
import Card from "antd/lib/card"
import Spin from "antd/lib/spin"
import Button from "antd/lib/button"
import Icon from "antd/lib/icon"
import Table from "antd/lib/table"

import ChargeDetail from "./ChargeDetail"
import ConsumeDetail from "./ConsumeDetail"

import { getBillAPI } from "../api"
import log from "../util/log"

const { ipcRenderer } = window.require("electron")

const formattedChargeList = function(list) {
    return list.map((item, index) => {
        const time = item['time']
        const amount = `￥${item['amount']}`
        const channel = item['channel']
        const tradeID = item['trade-id']

        return {
            key: index,
            time: time,
            amount: amount,
            channel: channel,
            tradeID: tradeID,
        }
    })
}

const formattedConsumeList = function(list) {
    return list.map((item, index) => {
        const time = item['time']
        const amount = `￥${item['amount']}`
        const taskName = item['task-name']
        const taskID = item['task-id']
        const tradeID = item['trade-id']

        return {
            key: index,
            time: time,
            amount: amount,
            taskName: taskName,
            taskID: taskID,
            tradeID: tradeID,
        }
    })
}

class BillHistory extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            content: 'bill-list', // bill-list, charge-detail, consume-detail
            chargeInfo: {
                time: '',
                amount: '',
                channel: '',
                tradeID: '',
            },
            consumeInfo: {
                taskID: '',
                amount: '',
                tradeID: '',
            },
            accessToken: '',
            bill: {
                isFetching: true,
                success: false,
                balance: '',
                voucher: '',
                chargeRecord: [],
                consumeRecord: [],
                errorMsg: '',
            },
        }

        this.fetchBill = this.fetchBill.bind(this)
        this.navToChargeDetail = this.navToChargeDetail.bind(this)
        this.navToConsumeDetail = this.navToConsumeDetail.bind(this)
        this.navToBillList = this.navToBillList.bind(this)
    }

    componentDidMount() {
        ipcRenderer.send('ready-to-show')

        ipcRenderer.on('user-info', (event, args) => {
            log('user-info', args)
            const { accessToken } = args
            this.setState({
                accessToken: accessToken,
            }, () => {
                this.fetchBill()
            })
        })
    }

    fetchBill() {
        this.setState({
            bill: {
                isFetching: true,
                success: false,
                balance: "",
                voucher: "",
                chargeRecord: [],
                consumeRecord: [],
                errorMsg: '',
            },
        })

        const url = getBillAPI()

        const { accessToken } = this.state

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
                const balance = result['balance']
                const voucher = result['voucher']
                const chargeRecord = result['charge-record']
                const consumeRecord = result['consume-record']

                this.setState({
                    bill: {
                        isFetching: false,
                        success: true,
                        balance: balance,
                        voucher: voucher,
                        chargeRecord: formattedChargeList(chargeRecord),
                        consumeRecord: formattedConsumeList(consumeRecord),
                        errorMsg: '',
                    },
                })
            })
            .catch((error) => {
                log(error)
                if (error.message === 'Failed to fetch') {
                    this.setState({
                        bill: {
                            isFetching: false,
                            success: false,
                            balance: '',
                            voucher: '',
                            chargeRecord: [],
                            consumeRecord: [],
                            errorMsg: '网络错误',
                        },
                    })
                } else {
                    this.setState({
                        bill: {
                            isFetching: false,
                            success: false,
                            balance: '',
                            voucher: '',
                            chargeRecord: [],
                            consumeRecord: [],
                            errorMsg: error.message,
                        },
                    })
                }
            })
    }

    closeBillHistoryWin() {
        ipcRenderer.send('close-bill-history-win')
    }

    navToChargeDetail(info) {
        this.setState({
            content: 'charge-detail',
            chargeInfo: info,
        })
    }

    navToConsumeDetail(info) {
        this.setState({
            content: 'consume-detail',
            consumeInfo: info,
        })
    }

    navToBillList() {
        this.setState({
            content: 'bill-list',
            chargeInfo: {},
            consumeInfo: {},
        })
    }

    render() {
        const styles = {
            container: {
                width: 600,
                height: 700,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            },
            header: {
                WebkitAppRegion: 'drag',
                width: '95%',
                height: '49px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            },
            contentContainer: {
                width: '100%',
                height: '650px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto',
            },
            itemContainer: {
                width: "400px",
                margin: "20px 0 20px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            },
        }

        const chargeColumns = [
            {
                title: "时间",
                dataIndex: "time",
                key: "time",
            },
            {
                title: "数额",
                dataIndex: "amount",
                key: "amount",
            },
            {
                title: "支付方式",
                dataIndex: "channel",
                key: "channel",
                render: (text, record) => {
                    switch (record.channel) {
                        case 'alipay':
                            return <div>支付宝</div>
                        case 'wxpay':
                            return <div>微信</div>
                    }
                },
            },
            {
                title: "操作",
                key: "action",
                render: (text, record) => {
                    const info = {
                        time: record['time'],
                        amount: record['amount'],
                        channel: record['channel'],
                        tradeID: record['tradeID']
                    }

                    return (
                        <span>
                            <a onClick={this.navToChargeDetail.bind(null, info)}>查看详情</a>
                        </span>
                    )
                },
            }
        ]

        const consumeColumns = [
            {
                title: "时间",
                dataIndex: "time",
                key: "time",
            },
            {
                title: "数额",
                dataIndex: "amount",
                key: "amount",
            },
            {
                title: "所属任务",
                dataIndex: "taskName",
                key: "taskName",
            },
            {
                title: "操作",
                key: "action",
                render: (text, record) => {
                    const info = {
                        taskID: record['taskID'],
                        tradeID: record['tradeID'],
                        amount: record['amount']
                    }

                    return (
                        <span>
                            <a onClick={this.navToConsumeDetail.bind(null, info)}>查看详情</a>
                        </span>
                    )
                },
            }
        ]

        const { accessToken, bill, content, chargeInfo, consumeInfo } = this.state

        let billContent
        switch (content) {
            case 'bill-list': {
                if (bill.isFetching) {
                    billContent = (
                        <div className="bill-container" style={styles.contentContainer}>
                            <div
                                className="bill-loading-container"
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
                    if (bill.success) {
                        billContent = (
                            <div className="bill-container" style={styles.contentContainer}>
                                <div
                                    style={{
                                        width: "500px",
                                        minHeight: '150px',
                                        padding: "20px 10px 20px 10px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Card style={{width: "100%"}}>
                                        <p>余额</p>
                                        <p>￥{bill.balance}</p>
                                    </Card>
                                </div>
                                <div
                                    style={{
                                        width: "500px",
                                        minHeight: '440px',
                                        padding: "20px 10px 20px 10px",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <h3 style={{}}>充值历史</h3>
                                    <Table
                                        columns={chargeColumns}
                                        dataSource={bill.chargeRecord}
                                        pagination={{pageSize: 5}}
                                    />
                                </div>
                                <div
                                    style={{
                                        width: "500px",
                                        minHeight: '440px',
                                        padding: "20px 10px 20px 10px",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <h3 style={{}}>消费历史</h3>
                                    <Table
                                        columns={consumeColumns}
                                        dataSource={bill.consumeRecord}
                                        pagination={{pageSize: 5}}
                                    />
                                </div>
                            </div>
                        )
                    } else {
                        billContent = (
                            <div className="charge-detail-container" style={styles.contentContainer}>
                                <div
                                    className="charge-error-msg-container"
                                    style={{
                                        width: 500,
                                        height: 500,
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
                                        <h3 style={{margin: 0}}>{bill.errorMsg}</h3>
                                    </div>
                                    <Button
                                        type="primary"
                                        style={{width: "100px"}}
                                        onClick={this.fetchChargeDetail}
                                    >点击重试</Button>
                                </div>
                            </div>
                        )
                    }
                }
                break
            }
            case 'charge-detail':
                billContent = <ChargeDetail
                    chargeInfo={chargeInfo}
                    navToBillList={this.navToBillList}
                />
                break
            case 'consume-detail':
                billContent = <ConsumeDetail
                    consumeInfo={consumeInfo}
                    navToBillList={this.navToBillList}
                    accessToken={accessToken}
                />
                break
            default:
                billContent = null
        }

        return (
            <div
                className='bill-history-container'
                style={styles.container}
            >
                <div
                    className='bill-history-header'
                    style={styles.header}
                >
                    <h2 style={{margin: 0}}>DlakeCloud</h2>
                    <div
                        onClick={this.closeBillHistoryWin}
                        style={{
                            WebkitAppRegion: 'no-drag',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        className='icon-container'
                    >
                        <Icon type="close" />
                    </div>
                </div>
                <div
                    className='divider'
                    style={{
                        borderBottom: '1px #e1e4e8 solid',
                        height: 0,
                        width: '100%',
                    }}
                />
                {billContent}
            </div>
        )
    }
}

// BillHistory.propTypes = {
//     tradeID: PropTypes.string.isRequired,
// }

export default BillHistory
