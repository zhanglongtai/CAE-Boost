import React from "react"
// import PropTypes from "prop-types"
import Icon from "antd/lib/icon"
import Select from "antd/lib/select"
import Button from "antd/lib/button"

import log from "../util/log"

const Option = Select.Option

const { ipcRenderer } = window.require("electron")

class Charge extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            amount: '',
        }

        this.setAmount = this.setAmount.bind(this)
    }

    componentDidMount() {
    }

    setAmount(amount) {
        this.setState({
            amount: amount,
        })
    }

    closeChargeWin() {
        ipcRenderer.send('close-charge-win')
    }

    render() {
        const styles = {
            container: {
                width: 500,
                height: 400,
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
                height: '350px',
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
                <div className='add-task-content' style={styles.content}>
                    <div style={styles.itemContainer}>
                        <h2>Dlake账户充值</h2>
                    </div>
                    <div style={{width: '80%', padding: '10px 10px 10px 10px'}}>
                        <h4>充值金额</h4>
                        <Select placeholder="选择充值金额" style={{width: '100%'}} onChange={this.setAmount}>
                            <Option value="100">￥100.00</Option>
                            <Option value="200">￥200.00</Option>
                            <Option value="500">￥500.00</Option>
                        </Select>
                    </div>
                    <div style={styles.itemContainer}>
                        <Button type="primary" style={{width: '100%'}}>支付宝支付</Button>
                    </div>
                    <div style={{width: '80%', padding: '10px 10px 10px 10px'}}>
                        <Button
                            style={{
                                backgroundColor: 'green',
                                width: '100%',
                                color: 'white',
                            }}
                        >微信支付</Button>
                    </div>
                </div>
            </div>
        )
    }
}

// Charge.propTypes = {
//     contentIndex: PropTypes.string.isRequired,
//     setContent: PropTypes.func.isRequired,
// }

export default Charge
