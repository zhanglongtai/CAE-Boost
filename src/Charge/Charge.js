import React from "react"
// import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"
import Icon from "antd/lib/icon"
import Select from "antd/lib/select"
import Button from "antd/lib/button"

import PrepareOrder from "./PrepareOrder"
import SendingOrder from "./SendingOrder"
import QRCodeURL from "./QRCodeURL"
import PayResult from "./PayResult"
import ErrorMsg from "./ErrorMsg"
import log from "../util/log"
import { getChargeAPI } from "../api"

const Option = Select.Option

const { ipcRenderer } = window.require("electron")

class Charge extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            accessToken: '',
            stage: 'prepare-order', // 'prepare-order', 'sending-order', 'qr-code', 'paying', 'pay-result', 'error-msg'
            amount: '',
            qrCodeURL: '',
            tradeID: '',
            payChannel: '',
            errMsg: '',
            backTo: '',
        }

        this.setAmount = this.setAmount.bind(this)
        this.sendOrder = this.sendOrder.bind(this)
        this.navTo = this.navTo.bind(this)
        this.navToErrorMsg = this.navToErrorMsg.bind(this)
        this.closeChargeWin = this.closeChargeWin.bind(this)
    }

    componentDidMount() {
        ipcRenderer.on('user-info', (event, args) => {
            const { accessToken } = args
            this.setState({
                accessToken: accessToken,
            })
        })
    }

    sendOrder(payChannel) {
        this.setState({
            stage: 'sending-order',
        })
        const { accessToken, amount } = this.state

        // const url = `${getloginAPI()}?username=${username}&password=${password}`
        const url = `${getChargeAPI()}`
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                amount: amount,
            }),
        })
            .then((response) => {
                if (response.status >= 200 && response.status < 500) {
                    return response
                } else {
                    if (response.status >= 500) {
                        const error = new Error('服务器错误，提交订单失败')
                        error.response = response
                        throw error
                    }
                }
            })
            .then((response) => {
                return response.json()
            })
            .then((result) => {
                const qrCodeURL = result['qr-code']
                const tradeID = result['trade-id']

                this.setState({
                    stage: 'qr-code',
                    qrCodeURL: qrCodeURL,
                    tradeID: tradeID,
                    payChannel: payChannel,
                    errMsg: '',
                    backTo: '',
                })
            })
            .catch((error) => {
                log('request failed', error.message)
                if (error.message === 'Failed to fetch') {
                    this.setState({
                        stage: 'error-msg',
                        amount: '',
                        qrCodeURL: '',
                        tradeID: '',
                        payChannel: '',
                        errMsg: '网络错误，发送订单失败',
                        backTo: 'prepare-order',
                    })
                } else {
                    this.setState({
                        stage: 'error-msg',
                        amount: '',
                        qrCodeURL: '',
                        tradeID: '',
                        payChannel: '',
                        errMsg: error.message,
                        backTo: 'prepare-order',
                    })
                }
            })
    }

    setAmount(amount) {
        this.setState({
            amount: amount,
        })
    }

    navTo(stage) {
        this.setState({
            stage: stage,
        })
    }

    navToErrorMsg(errMsg, backTo) {
        this.setState({
            stage: 'error-msg',
            amount: '',
            qrCodeURL: '',
            tradeID: '',
            payChannel: '',
            errMsg: errMsg,
            backTo: backTo,
        })
    }

    closeChargeWin() {
        const { amount } = this.state
        if (amount !== '') {
            ipcRenderer.send('update-bill')
        }
        
        ipcRenderer.send('close-charge-win')
    }

    render() {
        const styles = {
            container: {
                width: 500,
                height: 500,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            },
            header: {
                width: '95%',
                height: '49px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            },
            content: {
                width: '100%',
                height: '450px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            },
            itemContainer: {
                width: '80%',
                marginTop: '20px',
                padding: '10px 10px 10px 10px',
            },
        }

        const { accessToken, stage, amount, errMsg, backTo, qrCodeURL, tradeID, payChannel } = this.state

        let content
        switch (stage) {
            case 'prepare-order':
                content = <PrepareOrder
                    setAmount={this.setAmount}
                    sendOrder={this.sendOrder}
                />
                break
            case 'sending-order':
                content = <SendingOrder />
                break
            case 'qr-code':
                content = <QRCodeURL
                    accessToken={accessToken}
                    payChannel={payChannel}
                    qrCodeURL={qrCodeURL}
                    tradeID={tradeID}
                    navTo={this.navTo}
                    navToErrorMsg={this.navToErrorMsg}
                />
                break
            case 'pay-result':
                content = <PayResult
                    amount={amount}
                    closeChargeWin={this.closeChargeWin}
                />
                break
            case 'error-msg':
                content = <ErrorMsg
                    errMsg={errMsg}
                    backTo={backTo}
                    navTo={this.navTo}
                />
                break
            default:
                content = null
                break
        }

        return (
            <div
                className='charge'
                style={styles.container}
            >
                <div
                    className='charge-header'
                    style={styles.header}
                >
                    <h2 style={{margin: 0}}>DlakeCloud</h2>
                    <div
                        onClick={this.closeChargeWin}
                        style={{
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
                {content}
            </div>
        )
    }
}

// Charge.propTypes = {
//     contentIndex: PropTypes.string.isRequired,
//     setContent: PropTypes.func.isRequired,
// }

export default Charge
