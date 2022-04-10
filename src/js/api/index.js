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
    
    fetchApi(url) {
        try {
            return fetch(url)
                .then(response => response ? response : Promise.reject())                
                .then(response => response.ok ? response.json() : Promise.reject())
                .catch(error => {         
                    Promise.reject()
                });
        }
        catch (e) {     
            return Promise.reject(e);
        }
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
        return this.fetchApi(this.getTangledApiURL() + '/dAjjWCtPW1JbYwf6')               
    }

    listLanguages() {
        return this.fetchApi(this.getTangledApiURL() + '/wDqnBLvXY6FGUSfc')
                
    }

    listAds() {
        return this.fetchApi(this.getTangledApiURL() + '/aerijOtODMtkHo6i')               
    }

    listAdTypes() {
        return this.fetchApi(this.getTangledApiURL() + '/jbUwv8IG6XeYMqCq')
                
    }

    toggleAdStatus(advertisement_guid) {
        return this.fetchApi(this.getTangledApiURL() + `/C7neErVANMWXWuse?p0=${encodeURIComponent(JSON.stringify({advertisement_guid: advertisement_guid}))}`)             
    }

    resetAd(advertisementGUID) {
        return this.fetchApi(this.getTangledApiURL() + `/pKZdzEZrrdPA1jtl?p0=${advertisementGUID}`)
    }

    submitAdForm(formData) {
        return this.fetchApi(this.getTangledApiURL() + `/scWZ0yhuk5hHLd8s?p0=${encodeURIComponent(JSON.stringify(formData))}`)
    }

    requestAdvertisementPayment(advertisementGUID) {
        return this.fetchApi(this.getTangledApiURL() + `/QYEgbWuFZs5s7Kud?p0=${advertisementGUID}`)
   }

    sendTransaction(transactionOutputPayload) {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/XPzc85T3reYmGro1?p0=${JSON.stringify(transactionOutputPayload)}`)
    }

    getWalletUnspentTransactionOutputList(addressKeyIdentifier, stable) {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/FDLyQ5uo5t7jltiQ?p3=${addressKeyIdentifier}&p4=0&p7=${stable}&p10=0&p13=transaction_date desc`)
    }

    getTransactionHistory(addressKeyIdentifier) {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/w9UTTA7NXnEDUXhe?p0=${addressKeyIdentifier}`)
    }

    getTransaction(transactionID, shardID) {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/IBHgAmydZbmTUAe8?p0=${transactionID}&p1=${shardID}`)
    }

    getNodeStat() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/rKclyiLtHx0dx55M')
    }

    getNodeOsInfo() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/RLOk0Wji0lQVjynT')
    }

    getRandomMnemonic() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/Gox4NzTLDnpEr10v')        
    }

    getFreeOutputs(addressKeyIdentifier) {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/FDLyQ5uo5t7jltiQ?p3=${addressKeyIdentifier}&p4=0&p7=1&p10=0`)
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
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/GktuwZlVP39gty6v?p0=${password}&p1=${mnemonicPhrase}`)        
    }

    newSession(password) {
        password = escape_url_param(password);
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/PMW9LXqUv7vXLpbA?p0=${password}`)
    }

    endSession() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/pIQZEKY4T9vttBUk')
    }

    getSession() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/OBexeX0f0MsnL1S3')
    }

    getNodeConfig() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/CZOTAF5LfusB1Ht5')
    }

    getIsPrivateKeyExist() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/LOLb7q23p8rYSLwv')
    }

    getNodeConfigValueByName(name) {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/2wYLWQfWBa6GLPYs?p0=${name}`)
    }

    updateNodeConfigValue(key = null, value = null) {
        try {
            return this.getNodeConfigValueByName(key)
                       .then((config) => {
                            return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/LLpSTquu4tZL8Nu5`,
                                   {
                                       method : 'POST',
                                       headers: {'Content-Type': 'application/json'},
                                       body   : JSON.stringify({
                                           'p0': config.config_id,
                                           'p1': value
                                       })
                                   }
                               )                                
                       });
        }
        catch (e) {
            return Promise.reject();
        }
    }

    getNodePublicIP() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/qRHogKQ1Bb7OT4N9`)
    }

    listWalletAddressVersion() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/3XqkzNFzaTk1JPRf`)
    }

    addWalletAddressVersion(data) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/hMrav9QMiMyLQosB?p0=${data.version}&p1=${data.is_main_network}&p2=${data.regex_pattern}&p3=${data.is_default}`)
                .then(response => response? response : Promise.reject())            
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
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/XgxHmjINTEqANwtS?p0=${data.version}`)
    }

    getNodeAboutAttribute() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/AgsSNTSA0RHmWUkp?p0=${this.nodeID}&p1=ijDj2VlTyJBl5R4iTCmG`)
    }

    listAddresses(addressKeyIdentifier) {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/quIoaHsl8h6IwyEI?&p0=${addressKeyIdentifier}`)
    }

    getNextAddress() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/Lb2fuhVMDQm1DrLL')
    }

    interruptTransaction() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/RIlwZyfnizp2i8wh')
    }

    listActivePeers() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/0eoUqXNE715mBVqV?p0=2&p1=update_date%20desc')
    }

    getNodeAttributes(nodeID) {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + `/AgsSNTSA0RHmWUkp?p0=${nodeID}`)
    }

    resetTransactionValidation() {
        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/QISzUVake29059bi')
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

        return this.fetchApi(this.getAuthenticatedMillixApiURL() + '/P2LMh8NsUTkpWAH3',
                {
                    method : 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body   : JSON.stringify({
                        'p0': payload
                    })
                }
            )
            
    }
}


const _API = new API();
export default _API;
