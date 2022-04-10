class APIExternal {

    static FIATLEAK_API  = 'https://fiatleak.com/api/';

    getFiatleakPriceUSD() {
        try {
            return fetch(APIExternal.FIATLEAK_API+'/currency/pair/price/mlx/usd')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

}

const _APIExternal = new APIExternal();
export default _APIExternal;