var webpack = require('webpack')

module.exports = {
    entry: {
        login: './src/loginIndex.js',
        register: './src/registerIndex.js',
        mainView: './src/mainViewIndex.js',
        addTask: './src/addTaskIndex.js',
        addTaskErrorMsg: './src/addTaskErrorMsgIndex.js',
        charge: './src/chargeIndex.js',
        billHistory: './src/billHistoryIndex.js',
        nodeTypeSelector: './src/nodeTypeSelectorIndex.js',
        taskFileList: './src/taskFileListIndex.js',
    },
  
    output: {
        path: `${__dirname}/dist/js`,
        filename: '[name].index.js',
    },

    module: {
        loaders: [
            { 
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query:
                    {
                        presets:['env', 'react'],
                    },
            },
        ],
    },
}
