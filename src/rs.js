const is_node = typeof window === 'undefined';

class RapidSockets {

    constructor(options = {}) {
        this.gateway = options.gateway || 'wss://gateway.rapidsockets.com';
        this.api = options.api || 'https://api.rapidsockets.com'
        this.connection = null;
        this.authenticated = false;
        this.session = sha256(Math.random() + '-' + Math.random() + '-' + Math.random());
        this.message_queue = [];
        this.cbs = [];
        this.subscriptions = [];

        this.key = options.key || null;

        this.open_connection();
    }

    open_connection() {
        if (is_node) {
            const ws = require('ws');

            this.connection = new WebSocket(this.gateway);

            this.connection.on('open', this.on_open.bind(this));
            this.connection.on('message', this.on_message.bind(this));
            this.connection.on('close', this.on_close.bind(this));
            this.connection.on('error', this.on_error.bind(this));
        } else {
            this.connection = new WebSocket(this.gateway);

            this.connection.onopen = this.on_open.bind(this);
            this.connection.onmessage = this.on_message.bind(this);
            this.connection.onclose = this.on_close.bind(this);
            this.connection.onerror = this.on_error.bind(this);
        }

        this.flush_queue = this.flush_queue.bind(this);
    }

    on_open() {
        console.log('Connection established with RapidSockets Gateway');

        let packet = {
            action: 'authorize',
            payload: {
                key: this.key
            }
        };

        this.connection.send(JSON.stringify(packet));
    }

    on_message(message) {
        try {
            message = JSON.parse(message.data);

            // handle auth fail
            if (message.code === 'auth_fail') {
                console.log('Gateway authentication failed');
                return;
            }

            // handle auth success
            if (message.code === 'auth_success') {
                this.authenticated = true;
                this.flush_queue();
                this.establish_subscriptions();
            }

            // handle ping
            if (message.code === 'latency') {
                this.cbs.forEach(cb => {
                    if (cb.operation !== 'latency') return;

                    cb.callback(message.payload);
                });
            }

            // detect same client
            if (message.payload.session === this.session) return;

            // handle message
            if (message.code === 'message') {
                this.subscriptions.forEach(subscription => {
                    if (subscription.channel !== message.payload.channel) return;

                    message.payload.message = JSON.parse(message.payload.message);

                    subscription.callback(message);
                });
            }
        } catch (e) {
            console.log('Invalid message received from Gateway');
        }
    }

    on_close() {
        console.log('Connection to the Gateway was lost');

        this.authenticated = false;

        setTimeout(() => {
            console.log('Attempting to reconnect to the Gateway...');
            this.open_connection();
        }, 3000);
    }

    on_error(error) {
        throw new Error(error);
    }

    flush_queue() {
        if (this.message_queue.length > 0) {
            let messages = [].concat(this.message_queue);
            this.message_queue = [];

            messages.forEach(message => {
                this.connection.send(JSON.stringify(message));
            });
        }
    }

    establish_subscriptions() {
        this.subscriptions.forEach(subscription => {
            let packet = {
                action: 'subscribe',
                payload: {
                    channel: subscription.channel
                }
            };

            this.connection.send(JSON.stringify(packet));
        })
    }

    on(operation, callback) {
        if (typeof operation !== 'string')
            throw new Error('Operation must be a string');
        if (typeof callback !== 'function')
            throw new Error('Callback must be a function');

        this.cbs.push({ operation, callback });
    }

    subscribe(options) {
        if (typeof options.channel !== 'string')
            throw new Error('Channel must be a string');
        if (typeof options.callback !== 'function')
            throw new Error('Callback must be a function');

        this.subscriptions.push({
            channel: options.channel,
            callback: options.callback
        });

        let packet = {
            action: 'subscribe',
            payload: {
                channel: options.channel
            }
        };

        if (!this.authenticated || this.connection.readyState !== 1) {
            return;
        }

        this.connection.send(JSON.stringify(packet));
    }

    publish(options) {
        const http = window.XMLHttpRequest
            ? new XMLHttpRequest()
            : new ActiveXObject("Microsoft.XMLHTTP");

        http.open('POST', this.api + '/v1/messages');
        http.setRequestHeader('Authorization', this.key);
        http.setRequestHeader('Content-Type', 'application/json');
        http.send(JSON.stringify({
            channel: options.channel,
            message: JSON.stringify(options.message)
        }));
    }
}

if (is_node) {
    module.exports = RapidSockets;
}