import API from '../api';
import utils from './utils';
import * as validate from './validate';
import Translation from '../common/translation';
import {parse} from 'querystring';


export function getTransactionData(transaction_data_type, parameter_list, nft_sync_timestamp = null, status_new = null) {
    return new Promise((resolve, reject) => {
        API.getTransactionWithDataReceived(parameter_list.transaction_id, transaction_data_type)
           .then(transaction => {
               let warning_list = [];
               let error_list   = [];
               validateTransactionDataResponse(transaction, error_list, warning_list);
               if (error_list.length > 0) {
                   reject({
                       nft_sync_timestamp: nft_sync_timestamp,
                       error_list        : error_list,
                       warning_list      : warning_list,
                       status            : status_new
                   });
               }
               else {
                   transaction.file_key = parameter_list.key;

                   utils.getImageFromApi(transaction)
                        .then(image_data => {
                            let verify_dns_result = {};
                            if (image_data.dns) {
                                verify_dns_result = verifyDNS(image_data.dns, this.state.image_data.transaction?.address_key_identifier_to);
                            }
                            resolve({
                                nft_sync_timestamp: nft_sync_timestamp,
                                status            : status_new,
                                image_data,
                                error_list,
                                warning_list,
                                ...verify_dns_result
                            });
                        });
               }
           });
    });
}

export function parseUrlParameterList(url_parameter_list){
    let param_list = parse(url_parameter_list);
    return {
        transaction_id           : param_list.p0,
        address_key_identifier_to: param_list.p1,
        key                      : param_list.p2,
        hash                     : param_list.p3,
        metadata_hash            : param_list.p4
    };

}
function validateTransactionDataResponse(transaction, error_list, warning_list) {
    if (!transaction) {
        error_list.push({
            message: 'nft not found'
        });
    }
    else if (transaction.is_double_spend !== 0) {
        error_list.push({
            message: 'the nft you are viewing has been sent to more than one recipient, or was minted using invalid funds, and only one version is considered valid. the version of the nft that you are viewing is considered to be an invalid copy of the nft.'
        });
    }
    else if (transaction.is_spent !== 0) {
        error_list.push({
            message: 'the ownership and validity of nfts can change at any time, reload the page to see the most current state of this nft.'
        });
    }
    else if (transaction.is_stable !== 1) {
        warning_list.push({
            message: 'your browser has not validated this nft transaction yet. continue to reload the page to see the current state of this nft transaction.'
        });
    }
}

function verifyDNS(dns, address_key_identifier) {
    dns = validate.domain_name(Translation.getPhrase('1e0b22770'), dns, []);
    if (dns === null) {
        return {
            dnsValidated: false,
            dns
        };
    }
    else {
        API.isDNSVerified(dns, address_key_identifier)
           .then(data => {
               return {
                   dnsValidated: data.is_address_verified,
                   dns
               };
           })
           .catch(() => {
               return {
                   dnsValidated: false,
                   dns
               };
           });
    }
}
