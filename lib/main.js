const {CompositeDisposable, Disposable} = require('via');
const ServerStatusIndicator = require('./server-status-indicator');
const ServerStatus = require('./server-status');
const base = 'via://server-status';

const InterfaceConfiguration = {
    name: 'Server Status',
    description: 'Monitor Via server status.',
    command: 'server-status:open',
    uri: base
};

class ServerStatusPackage {
    initialize(){
        this.disposables = new CompositeDisposable();
        this.servers = null;

        this.disposables.add(via.commands.add('via-workspace', {
            'server-status:open': () => this.getStatusInstance().show(),
            'server-status:hide': () => this.getStatusInstance().hide()
        }));
    }

    getStatusInstance(state = {}){
        if(!this.servers){
            this.servers = new ServerStatus(state);
            this.servers.onDidDestroy(() => this.servers = null);
        }

        return this.servers;
    }

    consumeStatusBar(status){
        this.status = status;
        this.attachStatusBarView();
    }

    attachStatusBarView(){
        // if(!this.indicator){
        //     this.indicator = new ServerStatusIndicator({status: this.status});
        // }
    }

    deactivate(){
        this.disposables.dispose();

        if(this.indicator){
            this.indicator.destroy();
        }

        if(this.servers){
            this.servers.destroy();
        }
    }
}

module.exports = new ServerStatusPackage();
