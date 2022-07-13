import API from '../api/index.js';

export const getImageFromApi = (data) => {
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

export default {
    getImageFromApi
};
