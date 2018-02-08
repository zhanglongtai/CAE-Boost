import React from "react"
// import PropTypes from "prop-types"

import Header from "./Header"
import Content from "./Content"
import Footer from "./Footer"
import log from "../util/log"

class MainView extends React.Component {
    constructor() {
        super()
    }

    render() {
        const styles = {
            container: {
                width: 1000,
                height: 800,
            },
        }

        return (
            <div style={styles.container}>
                <Header />
                <Content />
                <Footer />
            </div>
        )
    }
}

// MainView.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default MainView
