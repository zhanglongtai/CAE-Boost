import React from "react"
import PropTypes from "prop-types"
import Button from "antd/lib/button"

import log from "../util/log"

const { ipcRenderer } = window.require("electron")

class PayResult extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.timer = setTimeout(() => {
            this.props.closeChargeWin()
        }, 3000)
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    render() {
        const { amount } = this.props

        return (
            <div
                style={{
                    width: '300px',
                    height: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                className='login-form-content'
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
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
                            color: 'green',
                        }}
                    >done</i>
                    <h3 style={{margin: 0}}>{`已充值成功￥${amount}!`}</h3>
                </div>
            </div>
        )
    }
}

PayResult.propTypes = {
    amount: PropTypes.string.isRequired,
    closeChargeWin: PropTypes.func.isRequired,
}

export default PayResult
