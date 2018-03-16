import React from "react"
import PropTypes from "prop-types"

class ResourceItem extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {
            selected,
            resourceIndex,
            price,
            memory,
            cpu,
            network,
            setResource,
        } = this.props

        return (
            <li
                onClick={() => {
                    setResource(resourceIndex)
                }}
            >
                <button className={selected ? "aurora-size unbuttonized ember-view selected" : "aurora-size unbuttonized ember-view"}>
                    <div className="pricing">
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
                    <div className="details">
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
                </button>
            </li>
        )
    }
}

ResourceItem.propTypes = {
    resourceIndex: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.object.isRequired,
    memory: PropTypes.string.isRequired,
    cpu: PropTypes.object.isRequired,
    network: PropTypes.string.isRequired,
    setResource: PropTypes.func.isRequired,
}

export default ResourceItem
