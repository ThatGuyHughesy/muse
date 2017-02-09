var path = require('path'),
    config;

config = {
    production: {
        redirect_uri: 'PRODUCTION_REDIRECT_URI',
        client_id: 'CLIENT_ID',
        client_secret: 'CLIENT_SECRET',
        server: {
            host: '127.0.0.1',
            port: '3000'
        }
    },
    development: {
        redirect_uri: 'DEVELOPMENT_REDIRECT_URI',
        client_id: 'CLIENT_ID',
        client_secret: 'CLIENT_SECRET',
        server: {
            host: '127.0.0.1',
            port: '3000'
        }
    }
};

module.exports = config;
