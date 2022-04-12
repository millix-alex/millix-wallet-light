import {escape_url_param} from '../helper/security';


class API {
    static HOST_MILLIX_API  = 'https://localhost:5500/api';
    static HOST_TANGLED_API = 'https://localhost:15555/api';

    constructor() {
        this.nodeID        = undefined;
        this.nodeSignature = undefined;

        try {
            const environment = require('../../environment');

            this.nodeID        = environment.NODE_ID;
            this.nodeSignature = environment.NODE_SIGNATURE;
        }
        catch (ex) {
        }
    }

    fetchApiTangled(url, param = {}) {
        return this.fetchApi(this.getTangledApiURL() + url, param);
    }

    fetchApiMillix(url, param = {}) {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + url, param);
    }

    fetchApi(url, param = {}) {
        let param_string  = '';
        const param_array = [];
        Object.keys(param).forEach(function(param_key, index) {
            param_array.push(param_key + '=' + param[param_key]);
        });
        if (param_array.length > 0) {
            param_string = '?' + param_array.join('&');
        }

        return fetch(url + param_string)
            .then(response => response ? response : Promise.reject())
            .then(response => response.ok ? response.json() : Promise.reject())
            .catch(error => {
                Promise.reject();
            });
    }

    setNodeID(nodeID) {
        this.nodeID = nodeID;
    }

    setNodeSignature(nodeSignature) {
        this.nodeSignature = nodeSignature;
    }

    getAuthenticatedMillixApiURL() {
        if (!this.nodeID || !this.nodeSignature) {
            throw Error('api is not ready');
        }
        return `${API.HOST_MILLIX_API}/${this.nodeID}/${this.nodeSignature}`;
    }

    getTangledApiURL() {
        return API.HOST_TANGLED_API;
    }

    listCategories() {
        return this.fetchApiTangled('/dAjjWCtPW1JbYwf6');
    }

    listLanguages() {
        return this.fetchApiTangled('/wDqnBLvXY6FGUSfc');

    }

    listAds() {
        return this.fetchApiTangled('/aerijOtODMtkHo6i');
    }

    listAdTypes() {
        return this.fetchApiTangled('/jbUwv8IG6XeYMqCq');

    }

    toggleAdStatus(advertisement_guid) {
        return this.fetchApiTangled(`/C7neErVANMWXWuse`, {
            'p0': encodeURIComponent(JSON.stringify({advertisement_guid: advertisement_guid}))
        });
    }

    resetAd(advertisementGUID) {
        return this.fetchApiTangled(`/pKZdzEZrrdPA1jtl?p0=${advertisementGUID}`);
    }

    submitAdForm(formData) {
        return this.fetchApiTangled(`/scWZ0yhuk5hHLd8s?p0=${encodeURIComponent(JSON.stringify(formData))}`);
    }

    requestAdvertisementPayment(advertisementGUID) {
        return this.fetchApiTangled(`/QYEgbWuFZs5s7Kud?p0=${advertisementGUID}`);
    }

    sendTransaction(transactionOutputPayload) {
        return this.fetchApiMillix(`/XPzc85T3reYmGro1?p0=${JSON.stringify(transactionOutputPayload)}`);
    }

    getWalletUnspentTransactionOutputList(addressKeyIdentifier, stable) {
        return this.fetchApiMillix(`/FDLyQ5uo5t7jltiQ?p3=${addressKeyIdentifier}&p4=0&p7=${stable}&p10=0&p13=transaction_date desc`);
    }

    getTransactionHistory(addressKeyIdentifier) {
        return this.fetchApiMillix(`/w9UTTA7NXnEDUXhe?p0=${addressKeyIdentifier}`);
    }

    getTransaction(transactionID, shardID) {
        return this.fetchApiMillix(`/IBHgAmydZbmTUAe8?p0=${transactionID}&p1=${shardID}`);
    }

    getNodeStat() {
        return this.fetchApiMillix('/rKclyiLtHx0dx55M');
    }

    getNodeOsInfo() {
        return this.fetchApiMillix('/RLOk0Wji0lQVjynT');
    }

    getRandomMnemonic() {
        return this.fetchApiMillix('/Gox4NzTLDnpEr10v');
    }

    getFreeOutputs(addressKeyIdentifier) {
        return this.fetchApiMillix(`/FDLyQ5uo5t7jltiQ?p3=${addressKeyIdentifier}&p4=0&p7=1&p10=0`);
    }

    verifyAddress(address) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/Xim7SaikcsHICvfQ?p0=${address}`)
                .then(response => response.json());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    newSessionWithPhrase(password, mnemonicPhrase) {
        password       = escape_url_param(password);
        mnemonicPhrase = escape_url_param(mnemonicPhrase);
        return this.fetchApiMillix(`/GktuwZlVP39gty6v?p0=${password}&p1=${mnemonicPhrase}`);
    }

    newSession(password) {
        password = escape_url_param(password);
        return this.fetchApiMillix(`/PMW9LXqUv7vXLpbA?p0=${password}`);
    }

    endSession() {
        return this.fetchApiMillix('/pIQZEKY4T9vttBUk');
    }

    getSession() {
        return this.fetchApiMillix('/OBexeX0f0MsnL1S3');
    }

    getNodeConfig() {
        return this.fetchApiMillix('/CZOTAF5LfusB1Ht5');
    }

    getIsPrivateKeyExist() {
        return this.fetchApiMillix('/LOLb7q23p8rYSLwv');
    }

    getNodeConfigValueByName(name) {
        return this.fetchApiMillix(`/2wYLWQfWBa6GLPYs?p0=${name}`);
    }

    updateNodeConfigValue(key = null, value = null) {
        try {
            return this.getNodeConfigValueByName(key)
                       .then((config) => {
                           return this.fetchApiMillix(`/LLpSTquu4tZL8Nu5`,
                               {
                                   method : 'POST',
                                   headers: {'Content-Type': 'application/json'},
                                   body   : JSON.stringify({
                                       'p0': config.config_id,
                                       'p1': value
                                   })
                               }
                           );
                       });
        }
        catch (e) {
            return Promise.reject();
        }
    }

    getNodePublicIP() {
        return this.fetchApiMillix(`/qRHogKQ1Bb7OT4N9`);
    }

    listWalletAddressVersion() {
        return this.fetchApiMillix(`/3XqkzNFzaTk1JPRf`);
    }

    addWalletAddressVersion(data) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/hMrav9QMiMyLQosB?p0=${data.version}&p1=${data.is_main_network}&p2=${data.regex_pattern}&p3=${data.is_default}`)
                .then(response => response ? response : Promise.reject())
                .then((response) => {
                    if (response.ok) {
                        try {
                            let response = this.listWalletAddressVersion();
                            return response;
                        }
                        catch (e) {
                            return Promise.reject(e);
                        }
                    }
                });
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    removeWalletAddressVersion(data) {
        return this.fetchApiMillix(`/XgxHmjINTEqANwtS?p0=${data.version}`);
    }

    getNodeAboutAttribute() {
        return this.fetchApiMillix(`/AgsSNTSA0RHmWUkp?p0=${this.nodeID}&p1=ijDj2VlTyJBl5R4iTCmG`);
    }

    listAddresses(addressKeyIdentifier) {
        return this.fetchApiMillix(`/quIoaHsl8h6IwyEI?&p0=${addressKeyIdentifier}`);
    }

    getNextAddress() {
        return this.fetchApiMillix('/Lb2fuhVMDQm1DrLL');
    }

    interruptTransaction() {
        return this.fetchApiMillix('/RIlwZyfnizp2i8wh');
    }

    listActivePeers() {
        return this.fetchApiMillix('/0eoUqXNE715mBVqV?p0=2&p1=update_date%20desc');
    }

    getNodeAttributes(nodeID) {
        return this.fetchApiMillix(`/AgsSNTSA0RHmWUkp?p0=${nodeID}`);
    }

    resetTransactionValidation() {
        return this.fetchApiMillix('/QISzUVake29059bi');
    }

    resetTransactionValidationByID(transaction_id = null) {
        let payload = [];
        if (typeof transaction_id === 'object') {
            transaction_id.forEach((item, idx) => {
                if (typeof item.transaction_id !== 'undefined') {
                    payload.push(item.transaction_id);
                }
            });
        }
        else {
            payload.push(transaction_id);
        }

        return this.fetchApiMillix('/P2LMh8NsUTkpWAH3',
            {
                method : 'POST',
                headers: {'Content-Type': 'application/json'},
                body   : JSON.stringify({
                    'p0': payload
                })
            }
        );

    }
}


const _API = new API();
export default _API;
