import React from "react"
import PropTypes from "prop-types"
import Icon from "antd/lib/icon"
import Select from "antd/lib/select"
import Button from "antd/lib/button"

import SendingOrder from "./SendingOrder"
import log from "../util/log"

const Option = Select.Option

const { ipcRenderer } = window.require("electron")

class PrepareOrder extends React.Component {
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
            },
            itemContainer: {
                width: '80%',
                marginTop: '20px',
                padding: '10px 10px 10px 10px',
            },
        }

        const { setAmount, sendOrder } = this.props
 
        return (
            <div className='add-task-content' style={styles.content}>
                <div style={styles.itemContainer}>
                    <h2>Dlake账户充值</h2>
                </div>
                <div style={{width: '80%', padding: '10px 10px 10px 10px'}}>
                    <h4>充值金额</h4>
                    <Select placeholder="选择充值金额" style={{width: '100%'}} onChange={setAmount}>
                        <Option value="100">￥100.00</Option>
                        <Option value="200">￥200.00</Option>
                        <Option value="500">￥500.00</Option>
                    </Select>
                </div>
                <div style={styles.itemContainer}>
                    <Button
                        type="primary"
                        style={{width: '100%'}}
                        onClick={sendOrder.bind(null, 'ali-pay')}
                    >支付宝支付</Button>
                </div>
                <div style={{width: '80%', padding: '10px 10px 10px 10px'}}>
                    <Button
                        style={{
                            backgroundColor: 'green',
                            width: '100%',
                            color: 'white',
                        }}
                        onClick={sendOrder.bind(null, 'wx-pay')}
                    >微信支付</Button>
                </div>
            </div>
        )
    }
}

PrepareOrder.propTypes = {
    setAmount: PropTypes.func.isRequired,
    sendOrder: PropTypes.func.isRequired,
}

export default PrepareOrder
