import React from "react"
import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"
import QRCode from 'qrcode'

import { getCheckPayAPI } from "../api"
import log from "../util/log"

// const { ipcRenderer } = window.require("electron")

class QRCodeURL extends React.Component {
    constructor(props) {
        super(props)

        this.checkPay = this.checkPay.bind(this)
    }

    componentDidMount() {
        const canvas = document.querySelector('#qrcode-canvas')
        const { qrCodeURL } = this.props
        QRCode.toCanvas(canvas, qrCodeURL, {
            width: 300, height: 300,
        }, (error) => {
            if (error) {
                log(error)
            }
        })

        this.timer = setTimeout(() => {
            this.checkPay()
        }, 5000)
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    checkPay() {
        const { tradeID, accessToken, payChannel, navTo, navToErrorMsg } = this.props

        // const url = getCheckPayAPI(tradeID)

        const url = getCheckPayAPI(payChannel)
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                'pay_id': tradeID,
            }),
        })
            .then((response) => {
                if (response.status >= 200 && response.status < 500) {
                    return response
                } else {
                    if (response.status >= 500) {
                        const error = new Error('服务器错误，交易失败')
                        error.response = response
                        throw error
                    }
                }
            })
            .then((response) => {
                return response.json()
            })
            .then((result) => {
                if (result['result'] === 'success') {
                    navTo('pay-result')
                } else if (result['result'] === 'pending') {
                    this.timer = setTimeout(() => {
                        this.checkPay()
                    }, 1000)
                } else {
                    // result['result'] === 'fail'
                    const error = new Error('交易失败')
                    throw error
                }
            })
            .catch((error) => {
                log('request failed', error.message)
                if (error.message === 'Failed to fetch') {
                    navToErrorMsg('网络错误，查询交易情况失败', 'prepare-order')
                } else {
                    navToErrorMsg(error.message, 'prepare-order')
                }
            })
    }

    render() {
        const styles = {
            content: {
                width: '100%',
                height: '450px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            },
        }

        const { payChannel } = this.props
        let logoURL = ''
        if ( payChannel === 'wx-pay') {
            logoURL = 'icon/WePayLogo.png'
        } else {
            logoURL = 'icon/AliPayLogo.png'
        }

        return (
            <div className='qr-code-content' style={styles.content}>
                <img src={logoURL} style={{height: 30}} />
                <canvas id='qrcode-canvas' />
                <h3>支付完成前请勿关闭支付页面</h3>
            </div>
        )
    }
}

QRCodeURL.propTypes = {
    accessToken: PropTypes.string.isRequired,
    payChannel: PropTypes.string.isRequired,
    qrCodeURL: PropTypes.string.isRequired,
    tradeID: PropTypes.string.isRequired,
    navTo: PropTypes.func.isRequired,
    navToErrorMsg: PropTypes.func.isRequired,
}

export default QRCodeURL
