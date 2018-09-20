const {Disposable, CompositeDisposable, Emitter, etch} = require('via');
const $ = etch.dom;
const ViaTable = require('via-table');
const base = 'via://server-status';
const status = {0: 'Connecting', 1: 'Open', 2: 'Closing', 3: 'Closed'};

module.exports = class ServerStatus {
    constructor(state){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.columns = ['Market', 'Trade Server'];

        this.columns = [
            {
                name: 'market',
                title: 'Market',
                default: true,
                accessor: market => market.title,
                classes: 'market'
            },
            {
                name: 'trades',
                title: 'Trade Server',
                default: true,
                accessor: market => status[market.status.last()] || market.status.last()
            }
        ];

        etch.initialize(this);

        this.initialize();
    }

    async initialize(){
        await via.markets.initialize();
        this.markets = via.markets.all();
        this.disposables.add(...this.markets.map(market => market.status.subscribe(this.update.bind(this))));
    }

    serialize(){
        return {
            deserializer: 'ServerStatus'
        };
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
        this.emitter.emit('did-destroy');
    }

    update(){
        etch.update(this);
    }

    properties(market){
        const status = market.status.last();

        return {
            classList: `tr server-status-market server-status-${status}`
        };
    }

    render(){
        return $.div({classList: 'server-status'},
            $(ViaTable, {columns: this.columns, data: this.markets, properties: item => this.properties(item)})
        );
    }

    toggle(){
        via.workspace.toggle(this);
    }

    show(focus){
        via.workspace.open(this, {searchAllPanes: true, activatePane: false, activateItem: false})
        .then(() => {
            via.workspace.open(base);
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
        return 'Server Status';
    }

    getURI(){
        return base;
    }

    onDidDestroy(callback){
        return this.emitter.on('did-destroy', callback);
    }
}
