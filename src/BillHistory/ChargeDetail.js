import React from "react"
import PropTypes from "prop-types"
import Card from "antd/lib/card"
import Button from "antd/lib/button"

import log from "../util/log"

const { ipcRenderer } = window.require("electron")

class ChargeDetail extends React.Component {
    constructor(props) {
        super(props)
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

ChargeDetail.propTypes = {
    chargeInfo: PropTypes.object.isRequired,
}

export default ChargeDetail
