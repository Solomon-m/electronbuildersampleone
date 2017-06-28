if (require('electron-squirrel-startup')) {
    console.log("ess :", require('electron-squirrel-startup'));
    app.quit();
}
var cp = require('child_process');
var remote = require('electron').remote
autoUpdater = remote.autoUpdater
var dialog = remote.dialog;
var fs = require('fs');
var path = require('path');

var handleStartupEvent = function() {
    console.log("Inside handleStartupEvent function:");
    if (process.platform !== 'win32') {
        return false;
    }

    var squirrelCommand = process.argv[1];
    switch (squirrelCommand) {
        case '--squirrel-install':
            {
                // 
                break;
            }
        case '--squirrel-firstrun':
            {
                console.log("Inside --squirrel-firstrun:");
                break;
            }
        case '--squirrel-updated':
            {
                console.log("Inside --squirrel-updated:: and calling updaterTest.seturl:");
                // updaterTest.seturl();
                executeCommand("--createShortcut");
                break;
                //  return true;
            }
        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Always quit when done
            executeCommand("--removeShortcut");
            app.quit();
            break;
            // return true;
        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated
            app.quit();
            break;
            // return true;
    }
};

if (handleStartupEvent()) {
    console.log("Inside handleStartupEvent function:", process.argv[1]);
    //  handleStartupEvent();
}

function executeCommand(commandtype) {
    var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
    var target = path.basename(process.execPath);
    var child = cp.spawn(updateDotExe, [commandtype, target], {
        detached: true
    });
    child.on('close', function(code) {
        app.quit();
    });
}

console.log("autoUpdater checking:::", autoUpdater);

var updaterTest = {
    pkgjson: null,
    url: 'http://localhost:9000/update/darwin',
    winurl: 'http://localhost:9000/update/win32/',
    seturl: function() {
        console.log("executing seturl function:");
        if (/^win32/.test(process.platform)) {
            this.pkgjson = JSON.parse(fs.readFileSync(path.join(process.resourcesPath, "app.asar", "package.json"), "utf8"));
            autoUpdater.setFeedURL(this.winurl);
            console.log("Inside updaterTest seturl: Url is:", this.winurl);
        } else {
            this.pkgjson = JSON.parse(fs.readFileSync(path.join(process.resourcesPath, "app", "package.json"), "utf8"));
            autoUpdater.setFeedURL(this.url + '?version=' + this.pkgjson.version);
            console.log("Inside updaterTest seturl: Url is:", this.url + '?version=' + this.pkgjson.version);
        }
        console.log("autoUpdater ::", autoUpdater);

        console.log("getURL::", autoUpdater.getFeedURL());
        autoUpdater.checkForUpdates();

        autoUpdater.on('update-downloaded', function(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndInstall) {
            //autoUpdater.on('update-downloaded', function() {
            console.log("arguments in update-downloaded:", arguments);
            //console.log("RES::", event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate);
            var index = dialog.showMessageBox(remote.getCurrentWindow(), {
                type: 'info',
                buttons: ['Restart', 'Later'],
                message: 'A new version is available! Please restart the app to apply the updates.',
                detail: releaseName + "\n\n" + releaseNotes
            });
            if (index !== 1) {
                console.log("quitAndInstall ::");
                quitAndInstall();
            }

        }.bind(this));

        autoUpdater.on('checking-for-update', function() {
            console.log("arguments checking-for-update:", arguments);
        });

        autoUpdater.on('update-not-available', function() {
            console.log("arguments update-not-available:", arguments);
        });

        autoUpdater.on('update-available', function() {
            console.log("arguments update-available:", arguments);
        });

        autoUpdater.on('error', function(error) {
            console.log("Error arguments :", arguments);
            if (error) {
                console.log("Error in UpdaterTest:", error);
                console.log("Error in UpdaterTest:", error.message);
                console.log("Error in UpdaterTest:", error.stack);

            }
        });

    }
};

//updaterTest.seturl();