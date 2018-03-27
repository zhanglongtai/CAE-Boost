import React from "react"
import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"
import Card from "antd/lib/card"
import Spin from "antd/lib/spin"
import Button from "antd/lib/button"
import Icon from "antd/lib/icon"

import log from "../util/log"

const { ipcRenderer } = window.require("electron")

class ConsumeDetail extends React.Component {
    constructor(props) {
        super(props)
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

    render() {
        const styles = {
            container: {
                width: 500,
                height: 1000,
                display: "flex",
            },
            itemContainer: {
                width: "400px",
                margin: "20px 0 20px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            },
        }

        const { time, amount, channel, tradeID } = this.props.chargeInfo

        return (
            <div className='charge-detail-container' style={styles.container}>
                <div style={{width: 100, height: 30}}>
                    <Button>返回</Button>
                </div>
                <Card>
                    <div style={styles.itemContainer}>
                        <p>交易ID:</p>
                        <p>{tradeID}</p>
                    </div>
                    <div style={styles.itemContainer}>
                        <p>支付金额:</p>
                        <p>{amount}</p>
                    </div>
                    <div style={styles.itemContainer}>
                        <p>支付日期:</p>
                        <p>{time}</p>
                    </div>
                    <div style={styles.itemContainer}>
                        <p>支付方式:</p>
                        <p>{channel}</p>
                    </div>
                </Card>
            </div>
        )
    }
}

ConsumeDetail.propTypes = {
    chargeInfo: PropTypes.object.isRequired,
}

export default ConsumeDetail
