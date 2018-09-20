const {CompositeDisposable, Disposable, Emitter, etch} = require('via');
const $ = etch.dom;
const timeout = 10000;

module.exports = class ServerStatusIndicator {
    constructor({status, action}){
        this.status = status
        this.action = action
        this.disposables = new CompositeDisposable();
        this.message = null;
        this.timeout = null;

        etch.initialize(this);

        this.statusBarTile = this.status.addRightTile({item: this});

        this.disposables.add(via.websockets.onDidDestroySocket(this.update.bind(this)));
        this.disposables.add(via.websockets.onDidOpenWebsocket(this.update.bind(this)));
        this.disposables.add(via.websockets.onDidCloseWebsocket(this.update.bind(this)));
        this.disposables.add(via.websockets.onDidWebsocketStatusChange(this.update.bind(this)));
    }

    render(){
        const connections = via.websockets.all();
        let connected = 0;
        let disconnected = 0;
        let status = '';

        if(connections.length){
            for(const connection of connections){
                if(connection.connected){
                    connected++;
                }else{
                    disconnected++;
                }
            }

            if(disconnected === connections.length){
                status = 'disconnected';
            }else if(disconnected){
                status = 'partially-connected';
            }else{
                status = 'connected';
            }
        }else{
            status = 'disabled';
        }

        return $.div({classList: `websockets-status toolbar-button websockets-${status}`, onClick: this.open},
            $.svg({class: 'websockets-status-icon', viewBox: '0 0 73.738 52.365', width: 16, height: 16},
                $.path({d: 'M73.377,15.134C63.618,5.375,50.652,0,36.87,0h-0.001C23.087,0,10.12,5.375,0.362,15.135L0,15.496l7.959,7.96l0.362-0.362c7.636-7.637,17.775-11.843,28.548-11.843s20.912,4.206,28.549,11.843l0.361,0.362l7.959-7.96L73.377,15.134z'}),
                $.path({d: 'M36.842,20.455c-8.312,0-16.134,3.244-22.025,9.135l-0.361,0.362l7.96,7.958l0.362-0.361c3.771-3.772,8.786-5.85,14.121-5.85c5.321,0,10.324,2.073,14.083,5.833l0.359,0.36l7.926-7.925l-0.361-0.361C53.002,23.705,45.169,20.455,36.842,20.455z'}),
                $.path({d: 'M36.869,40.905c-2.874,0-5.572,1.115-7.598,3.141l-0.362,0.363l7.96,7.957l7.959-7.957l-0.36-0.363C42.441,42.02,39.743,40.905,36.869,40.905z'})
            ),
            $.div({classList: 'websockets-status-message'}, `${connected}/${connections.length}`)
        );
    }

    open(){
        via.workspace.getElement().dispatchEvent(new CustomEvent('websockets:open', {bubbles: true, cancelable: true}));
    }

    update(){
        etch.update(this);
    }

    destroy(){
        this.statusBarTile.destroy();
        this.disposables.dispose();
    }
}