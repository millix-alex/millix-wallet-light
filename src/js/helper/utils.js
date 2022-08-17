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

               const image_url = URL.createObjectURL(blob);

               return resolve(nftImageData(image_url, data));
           });
    });
};

function nftImageData(image_url, transaction) {
    return {
        src              : image_url,
        width            : 4,
        height           : 3,
        transaction      : transaction,
        hash             : transaction.transaction_output_attribute[0].value.file_list[0].hash,
        name             : transaction.transaction_output_attribute[0].file_data?.name,
        description      : transaction.transaction_output_attribute[0].file_data?.description,
        attribute_type_id: transaction.transaction_output_attribute[0].attribute_type_id,
        amount           : transaction.amount,
        txid             : transaction.transaction_id
    };
}


export default {
    getImageFromApi
};
