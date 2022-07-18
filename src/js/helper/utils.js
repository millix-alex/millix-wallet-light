import API from '../api/index.js';

const getImageFromApi = (data) => {
    return new Promise((resolve) => {
        API.getNftImage(data)
           .then(result => {
               return result.ok ? result.blob() : undefined;
           })
           .then(blob => {
               if (!blob) {
                   return resolve();
               }
               return resolve(URL.createObjectURL(blob));
           });
    });
};

const parseRawImageData = (image_url, row) => {
    return (null, {
        src   : image_url,
        width : 4,
        height: 3,
        hash  : row.transaction_output_attribute[0].value.file_list[0].hash,
        amount: row.amount,
        txid  : row.transaction_id
    });
};


export default {
    getImageFromApi,
    parseRawImageData
};
