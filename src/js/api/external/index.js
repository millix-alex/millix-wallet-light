class APIExternal {

    constructor() {

    }

    getFiatleakPriceUSD() {
        try {
            return fetch('https://fiatleak.com/api/currency/pair/price/mlx/usd')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

}

const _APIExternal = new APIExternal();
export default _APIExternal;