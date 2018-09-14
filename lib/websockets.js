const {Disposable, CompositeDisposable, Emitter} = require('via');
const etch = require('etch');
const $ = etch.dom;
const ViaTable = require('via-table');
const base = 'via://websockets';
const moment = require('moment');
const status = {0: 'Connecting', 1: 'Open', 2: 'Closing', 3: 'Closed'};

module.exports = class Websockets {
    constructor(state){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.columns = ['URI', 'Status', 'Opened On'];
        this.websockets = via.websockets.all();

        this.columns = [
            {
                name: 'uri',
                title: 'Websocket URI',
                default: true,
                accessor: w => w.uri, classes: 'uri'
            },
            {
                name: 'status',
                title: 'Connection Status',
                default: true,
                accessor: w => status[w.status]
            },
            {
                name: 'date',
                title: 'Opened At',
                default: true,
                accessor: w => (w.opened ? moment(w.opened).format('YYYY-MM-DD HH:mm:ss') : 'N/A')
            }
        ];

        etch.initialize(this);

        this.disposables.add(via.websockets.onDidCreateSocket(this.update.bind(this)));
        this.disposables.add(via.websockets.onDidDestroySocket(this.update.bind(this)));
        this.disposables.add(via.websockets.onDidWebsocketStatusChange(() => etch.update(this)));
    }

    serialize(){
        return {
            deserializer: 'Websockets'
        };
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
        this.emitter.emit('did-destroy');
    }

    update(){
        this.websockets = via.websockets.all();
        etch.update(this);
    }

    properties(item){
        const status = item.connected ? 'connected' : 'disconnected';

        return {
            classList: `tr websocket-item websocket-${status}`
        };
    }

    render(){
        return $.div({classList: 'websockets'},
            $(ViaTable, {columns: this.columns, data: this.websockets, properties: item => this.properties(item)})
        );
    }

    toggle(){
        via.workspace.toggle(this);
    }

    show(focus){
        via.workspace.open(this, {searchAllPanes: true, activatePane: false, activateItem: false})
        .then(() => {
            via.workspace.open(base);
            // via.workspace.paneContainerForURI(this.getURI()).show();
            if(focus) this.focus();
        });
    }

    hide(){
        via.workspace.hide(this);
    }

    focus(){
        this.element.focus();
    }

    unfocus(){
        via.workspace.getCenter().activate();
    }

    hasFocus(){
        return document.activeElement === this.element;
    }

    getTitle(){
        return 'Websockets';
    }

    getURI(){
        return base;
    }

    onDidDestroy(callback){
        return this.emitter.on('did-destroy', callback);
    }
}
