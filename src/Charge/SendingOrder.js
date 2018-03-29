import React from "react"
// import PropTypes from "prop-types"
import Icon from "antd/lib/icon"
import Spin from "antd/lib/spin"

import log from "../util/log"

// const { ipcRenderer } = window.require("electron")

class SendingOrder extends React.Component {
    constructor(props) {
        super(props)
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

        const antIcon = <Icon type="loading" style={{ fontSize: 36 }} spin />

        return (
            <div className='sending-order' style={styles.content}>
                <Spin indicator={antIcon} />
                <h3 style={{margin: '20px 0 20px 0'}}>正在提交订单...</h3>
            </div>
        )
    }
}

// SendingOrder.propTypes = {
//     contentIndex: PropTypes.string.isRequired,
//     setContent: PropTypes.func.isRequired,
// }

export default SendingOrder
