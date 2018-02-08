const {
    app,
    BrowserWindow,
    ipcMain,
    shell,
} = require("electron")

const config = {
    env: 'dev', // 'dev' or 'prod'
}

let reactDevtool = null
switch (process.platform) {
    case 'linux':
        reactDevtool = '/home/tiger/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/2.3.3_0'
        break
    case 'win32':
        reactDevtool = 'C:\\Users\\Tiger\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\3.1.0_0'
        break
}

// win pool for client
const win = {
    winMainView: null,
    winTestDownload: null,
}


// ========== util func ==========
const log = function() {
    console.log.apply(null, arguments)
}
// ========== util func ==========

app.on('ready', () => {
    if (config.env === 'dev') {
        BrowserWindow.addDevToolsExtension(reactDevtool)
    }

    createMainViewWin()
})


// ========== TestDownload ==========
const createTestDownloadWin = function() {
    const options = {
        width: 600,
        height: 600,
        show: true,
    }

    win.winTestDownload = new BrowserWindow(options)
    
    if (config.env === 'dev') {
        win.winTestDownload.webContents.openDevTools()
    }
    
    win.winTestDownload.loadURL(`file://${__dirname}/renderer/testDownload.html`)
}

ipcMain.on('download-file', (event, url) => {
    log('down load url', url)
    win.winTestDownload.webContents.downloadURL(url)

    const fileNameList = url.split('/')
    const fileName = fileNameList[fileNameList.length - 1]

    win.winTestDownload.webContents.session.on('will-download', (sessionEvent, item, webContents) => {
        // Set the save path, making Electron not to prompt a save dialog.
        item.setSavePath(`/tmp/${fileName}`)
      
        item.on('updated', (updateEvent, state) => {
            if (state === 'interrupted') {
                log('Download is interrupted but can be resumed')
            } else if (state === 'progressing') {
                if (item.isPaused()) {
                    log('Download is paused')
                } else {
                    const received = item.getReceivedBytes()
                    const total = item.getTotalBytes()
                    const percent = Math.floor(received/total*100)
                    log(`Received bytes: ${item.getReceivedBytes()}`)
                    event.sender.send('download-update', percent)
                }
            }
        })

        item.once('done', (event, state) => {
            if (state === 'completed') {
                log('Download successfully')
            } else {
                log(`Download failed: ${state}`)
            }
        })

        ipcMain.on('pause-download', () => {
            item.pause()
        })

        ipcMain.on('resume-download', () => {
            item.resume()
        })
    })
})
// ========== TestDownload ==========


// ========= MainView ==========
const createMainViewWin = function() {
    const options = {
        width: 1000,
        height: 800,
        frame: false,
    }

    win.winMainView = new BrowserWindow(options)

    win.winMainView.setMenuBarVisibility(false)

    if (config.env === 'dev') {
        win.winMainView.webContents.openDevTools()
    }

    win.winMainView.loadURL(`file://${__dirname}/renderer/mainView.html`)
}
