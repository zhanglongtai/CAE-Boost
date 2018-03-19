import React from "react"
import PropTypes from "prop-types"

import log from "../util/log"

class NodeTypeItem extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const styles = {
            container: {
                width: 160,
            },
            title: {
                width: 160,
                height: 50,
            },
            boxSelected: {
                width: 160,
                height: 180,
                color: 'rgb(51, 51, 51)',
                textAlign: 'center',
                background: 'rgb(255, 255, 255)',
                borderRadius: '3px',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgb(0, 105, 255)',
                borderImage: 'initial',
            },
            box: {
                width: 160,
                height: 180,
                color: 'rgb(51, 51, 51)',
                textAlign: 'center',
                background: 'rgb(255, 255, 255)',
                borderRadius: '3px',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgb(223, 223, 223)',
                borderImage: 'initial',
            },
            headerSelected: {
                color: 'rgb(0, 105, 255)',
                background: 'rgb(245, 249, 255)',
                borderBottom: '1px solid rgb(0, 105, 255)',
                padding: '18px 0px 11px',
            },
            header: {
                borderBottom: '1px solid rgb(223, 223, 223)',
                padding: '18px 0px 11px',
            },
            details: {
                height: '93px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            },
        }

        const {
            selected,
            nodeTypeIndex,
            price,
            memory,
            cpu,
            network,
            setNodeType,
            name,
        } = this.props

        return (
            <div style={styles.container}>
                <div style={styles.title}>
                    <h3 style={{margin: 0}}>{name}</h3>
                </div>
                <div
                    style={selected ? styles.boxSelected : styles.box}
                    onClick={() => {
                        setNodeType(nodeTypeIndex, name)
                    }}
                >
                    <div className="pricing" style={selected ? styles.headerSelected : styles.header}>
                        <div className="price monthly ">
                            <span className="dollar">￥&nbsp;</span>
                            <span
                                className="cost"
                                style={{
                                    fontSize: "24px",
                                    margin: "0 5px 0 0",
                                }}
                            >{ price.month }</span>
                            <span className="period">/月</span>
                        </div>
                        <div className="price hourly">
                            <span
                                className="cost"
                                style={{
                                    margin: "0 5px 0 0",
                                }}
                            >{ `￥${price.hour}` }</span>
                            <span className="period">/小时</span>
                        </div>
                    </div>
                    <div className="details" style={styles.details}>
                        <span className="memory_and_cpu">
                            <strong>{ memory }
                            </strong>{ ` / ${cpu.num} CPU` }
                        </span>
                        <span className="disk">
                            <strong>20 GB
                            </strong> SSD disk
                        </span>
                        <span className="bandwidth">
                            <strong>{ network }
                            </strong> transfer
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}

NodeTypeItem.propTypes = {
    nodeTypeIndex: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.object.isRequired,
    memory: PropTypes.string.isRequired,
    cpu: PropTypes.object.isRequired,
    network: PropTypes.string.isRequired,
    setNodeType: PropTypes.func.isRequired,
}

export default NodeTypeItem
