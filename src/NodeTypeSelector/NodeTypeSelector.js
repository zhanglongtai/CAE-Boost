import React from "react"
// import PropTypes from "prop-types"
import Input from "antd/lib/input"
import Icon from "antd/lib/icon"
import Select from "antd/lib/select"
import InputNumber from "antd/lib/input-number"
import Button from "antd/lib/button"

import log from "../util/log"

const Option = Select.Option

const { ipcRenderer } = window.require("electron")

const resourceCategoryList = [
    {
        name: "GPU计算型 (gn5)",
        price: {
            month: 11520,
            hour: 16,
        },
        cpu: {
            num: 16,
            model: "E5-2682 v4",
            frequency: "2.5GHz",
        },
        memory: "120GB",
        gpu: "Tesla P100 x 8",
        network: "25 Gbps",
    },
    {
        name: "计算型 (c5)",
        price: {
            month: 44800,
            hour: 64,
        },
        cpu: {
            num: 64,
            model: "Skylake Xeon Platinum 8163",
            frequency: "2.5GHz",
        },
        memory: "128GB",
        gpu: "N/A",
        network: "20 Gbps",
    },
    {
        name: "计算网络增强型 (sn1ne)",
        price: {
            month: 22400,
            hour: 32,
        },
        cpu: {
            num: 32,
            model: "E5-2682 v4",
            frequency: "2.5GHz",
        },
        memory: "64GB",
        gpu: "N/A",
        network: "10 Gbps",
    },
    {
        name: "计算网络增强型 (sn2ne)",
        price: {
            month: 39200,
            hour: 56,
        },
        cpu: {
            num: 56,
            model: "56核 E5-2682 v4 2.5GHz",
            frequency: "2.5GHz",
        },
        memory: "224GB",
        gpu: "N/A",
        network: "10 Gbps",
    },
    {
        name: "通用型 (g5)",
        price: {
            month: 44800,
            hour: 64,
        },
        cpu: {
            num: 64,
            model: "Skylake Xeon Platinum 8163",
            frequency: "2.5GHz",
        },
        memory: "256GB",
        gpu: "N/A",
        network: "20 Gbps",
    },
]

class NodeTypeSelector extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            nodeTypeIndex: 0,
            nodeType: '',
        }
    }

    componentDidMount() {
    }

    closeNodeTypeSelectorWin() {
        ipcRenderer.send('close-node-type-selector-win')
    }

    setNodeType(index, type) {
        this.setState({
            nodeTypeIndex: index,
            nodeType: type,
        })
    }

    render() {
        const styles = {
            container: {
                width: 800,
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
                height: '700px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            },
            itemContainer: {
                width: '95%',
                marginTop: '20px',
                borderRadius: '3px',
                border: '1px #e1e4e8 solid',
                padding: '10px 10px 10px 10px',
            },
            footer: {
                width: '95%',
                height: '49px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
        }

        const { nodeTypeIndex } = this.state

        return (
            <div
                className='node-type-selector'
                style={styles.container}
            >
                <div
                    className='node-type-selector-header'
                    style={styles.header}
                >
                    <h2 style={{margin: 0}}>DlakeCloud</h2>
                    <div
                        onClick={this.closeNodeTypeSelectorWin}
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
                <div className='node-type-selector-content' style={styles.content}>
                    {
                        resourceCategoryList.map((item, index) => {
                            return <ResourceItem
                                key={index}
                                resourceIndex={index}
                                name={item.name}
                                selected={nodeTypeIndex === index + 1}
                                price={item.price}
                                memory={item.memory}
                                cpu={item.cpu}
                                network={item.network}
                                setResource={this.setResource}
                            />
                        })
                    }
                </div>
                <div
                    className='divider'
                    style={{
                        borderBottom: '1px #e1e4e8 solid',
                        height: 0,
                        width: '100%',
                    }}
                />
                <div
                    className='node-type-selector-footer'
                    style={styles.footer}
                >
                    <Button type="primary">提交</Button>
                </div>
            </div>
        )
    }
}

// NodeTypeSelector.propTypes = {
//     contentIndex: PropTypes.string.isRequired,
//     setContent: PropTypes.func.isRequired,
// }

export default NodeTypeSelector
