const {CompositeDisposable, Disposable} = require('via');
const WebsocketsStatusView = require('./websockets-status-view');
const Websockets = require('./websockets');
const base = 'via://websockets';

const InterfaceConfiguration = {
    name: 'Websockets',
    description: 'Monitor open websocket connections.',
    command: 'websockets:open',
    uri: base
};

class WebsocketsPackage {
    initialize(){
        this.disposables = new CompositeDisposable();
        this.websockets = null;

        this.disposables.add(via.commands.add('via-workspace', {
            'websockets:open': () => this.getWebsocketsInstance().show(),
            'websockets:hide': () => this.getWebsocketsInstance().hide()
        }));
    }

    getWebsocketsInstance(state = {}){
        if(!this.websockets){
            this.websockets = new Websockets(state);
            this.websockets.onDidDestroy(() => this.websockets = null);
        }

        return this.websockets;
    }

    consumeStatusBar(status){
        this.status = status;
        this.attachStatusBarView();
    }

    attachStatusBarView(){
        if(!this.statusViewAttached){
            this.statusViewAttached = new WebsocketsStatusView({status: this.status});
        }
    }

    deactivate(){
        this.disposables.dispose();

        if(this.statusViewAttached){
            this.statusViewAttached.destroy();
        }

        if(this.websockets){
            this.websockets.destroy();
        }
    }
}

module.exports = new WebsocketsPackage();
