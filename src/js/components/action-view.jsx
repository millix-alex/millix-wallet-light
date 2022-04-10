import React, {Component} from 'react';
import {Button, Col, Row} from 'react-bootstrap';
import fs from 'fs';
import API from '../api';
import ModalView from './utils/modal-view';
import * as text from '../helper/text';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import MnemonicView from './utils/mnemonic-view';

const styles = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    },
    left    : {
        display       : 'flex',
        justifyContent: 'left'
    }
};


class ActionView extends Component {
    constructor(props) {
        super(props);
        let now    = Date.now();
        this.state = {
            fileKeyExport: 'export_' + now,
            fileKeyImport: 'import_' + now,
            modalShow    : false,
            modalShowMnemonicPhrase : false,
            mnemonic: []
        };
    }

    exportPrivateKey() {
        API.getMnemonicPhrase().then(phrase => {
            let json = JSON.stringify(phrase);
            const blob = new Blob([json]);
            const fileDownloadUrl = URL.createObjectURL(blob);
               
           this.setState ({
               fileDownloadUrl: fileDownloadUrl
            }, // Step 5
            () => {
                this.dofileDownload.click();                   // Step 6
                URL.revokeObjectURL(fileDownloadUrl);          // Step 7
                this.setState({fileDownloadUrl: ""})
            })          
        })
    }

    showMnemonicPhraseModal(){

        API.getMnemonicPhrase().then(phrase => {
            this.setState({
                mnemonic: phrase.mnemonic_phrase.split(' ')
            });
            this.changeMnemonicModalShow(true)
           
        })
        
    }
                            

    importKey() {
        let self = this;
        if (this.inputImport.value === '') {
            this.setState({importingWallet: false});
            return;
        }

        console.log('importing keys from ', this.inputImport.value);

        fs.readFile(this.inputImport.value, 'utf8', function(err, dataString) {
            if (err) {
                this.setState({importingWallet: false});
                return;
            }

            const data = JSON.parse(dataString);
            if (data.mnemonic_phrase) {
                /*walletUtils.storeMnemonic(data.mnemonic_phrase, true)
                 .then(() =>
                 new Promise(resolve => {
                 async.each(data.addresses, (entry, callback) => {
                 database.getRepository('keychain')
                 .addAddress(entry.wallet_id, entry.is_change, entry.address_position, entry.address_base, entry.address_version, entry.address_key_identifier, entry.address_attribute)
                 .then(() => callback()).catch((e) => {
                 console.log(e);
                 callback();
                 });
                 }, () => resolve());
                 })
                 )
                 .then(() => {
                 self.setState({importingWallet: false});
                 eventBus.emit('wallet_lock', {isImportWallet: true});
                 });*/
            }
            else {
                self.setState({importingWallet: false});
            }
        });
        this.setState({fileKeyImport: 'import_' + Date.now()});
    }

    optimizeWallet() {
        /*wallet.stop();
         network.stop();
         peer.stop();
         logManager.stop();
         store.dispatch(updateWalletMaintenance(true));
         database.runVacuum()
         .then(() => database.runWallCheckpoint())
         .then(() => {
         store.dispatch(updateWalletMaintenance(false));
         wallet.initialize(true)
         .then(() => logManager.initialize())
         .then(() => network.initialize())
         .then(() => peer.initialize());
         });*/
    }

    resetTransactionValidation() {
        API.resetTransactionValidation().then(_ => {
            this.props.history.push('/unspent-transaction-output-list/pending');
        });
    }

    changeModalShow(value = true) {
        this.setState({
            modalShow: value
        });
    }

    changeMnemonicModalShow(value = true) {
        this.setState({
            modalShowMnemonicPhrase:value
        });
    }

    render() {
        return (
            <div>
                <ModalView show={this.state.modalShow}
                           size={'lg'}
                           heading={'reset validation'}
                           on_close={() => this.changeModalShow(false)}
                           on_accept={() => this.resetTransactionValidation()}
                           body={<div>
                               <div>continuing will force your node to
                                   revalidate all your transactions. this may
                                   take some time depending on how many
                                   transactions you have.
                               </div>
                               {text.get_confirmation_modal_question()}
                           </div>}/>
                <Row>
                    <Col>
                        {/*<div className={'panel panel-filled'}>
                         <div className={'panel-heading bordered'}>optimize</div>
                         <hr className={'hrPanel'}/>
                         <div className={'panel-body'}>
                         <Row className="mb-1">
                         <Col style={styles.left}>
                         <p>the optimize action compacts the
                         local database and optimize the
                         storage.</p>
                         </Col>
                         </Row>
                         <Row className="mb-3">
                         <Col style={styles.centered}>
                         <Button variant="light"
                         className={'btn btn-w-md btn-accent'}
                         onClick={() => {
                         this.optimizeWallet();
                         }} disabled={true}>
                         optimize
                         </Button>
                         </Col>
                         </Row>
                         </div>
                         </div>*/}
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>reset
                                validation
                            </div>
                            <div className={'panel-body'}>
                                <div>
                                    reset validation forces your node to
                                    revalidate all your transactions (to or from
                                    you)
                                </div>
                                <div>
                                    it is recommended to do in one of the
                                    following cases:
                                    <ul>
                                        <li>if you have
                                            transaction(s) in pending state for
                                            longer than 10-15 minutes
                                        </li>
                                        <li>
                                            you think that your balance is wrong
                                        </li>
                                    </ul>
                                </div>

                                <Row>
                                    <Col style={styles.centered}>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => this.changeModalShow()}>
                                            <FontAwesomeIcon
                                                icon="rotate-left"
                                                size="1x"/>reset validation
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        {/*<div className={'panel panel-filled'}>
                         <div className={'panel-heading bordered'}>load wallet</div>
                         <hr className={'hrPanel'}/>
                         <div className={'panel-body'}>
                         <Row className="mb-1">
                         <Col style={styles.left}>
                         <p>the load wallet action allows the
                         user to
                         load a previously exported wallet
                         private key in this millix
                         node.</p>
                         </Col>
                         </Row>
                         <Row className="mb-3">
                         <Col style={styles.centered}>
                         <Button variant="light"
                         className={'btn btn-w-md btn-accent'}
                         onClick={() => {
                         this.inputImport.click();
                         this.setState({importingWallet: true});
                         }} disabled={true}>
                         load wallet
                         </Button>
                         </Col>
                         </Row>
                         </div>
                         </div>*/
                         <div className={'panel panel-filled'}>
                         <div className={'panel-heading bordered'}>mnemonic phrase</div>
                         <div className={'panel-body'}>
                         <Row className="mb-1">
                         <Col style={styles.left}>
                         <p>mnemonic phrase is a unique string that allows you to access your wallet. if you loose your mnemonic phrase you will not be able to access this wallet or any funds it contains. we recommend you to write these words down and keep them in a safe place. avoid saving your mnemonic phrase in a computer or online service and do not take a screenshot of it. millix_private_key.json contains your wallet mnemonic phrase.</p>
                         </Col>
                         </Row>
                         <Row className="mb-3">
                         <Col style={styles.centered}>
                            <Button variant="outline-primary"
                            className={'btn btn-w-md btn-accent'}
                            onClick={() => {
                                this.exportPrivateKey();
                            }} >
                            save millix_private_key.json
                            </Button>

                          </Col>
                          </Row>
                          <Row className="mb-3">
                          <Col style={styles.centered}>  
                            <Button variant="outline-primary"
                            className={'btn btn-w-md btn-accent'}
                            onClick={() => {
                                this.showMnemonicPhraseModal()
                            }} >show mnemonic phrase
                            </Button>

                         </Col>
                         </Row>
                         </div>
                         </div>}
                    </Col>
                </Row>
                <div>
                    <input style={{display: 'none'}} type="file" accept=".json"
                        ref={(component) => this.inputImport = component}
                        onChange={this.importKey.bind(this)}
                        key={this.state.fileKeyImport}/>
                   
                    <a style={{display: 'none'}}
                    download="millix_private_key.json"	
                    href={this.state.fileDownloadUrl}
                    ref={e=>this.dofileDownload = e}
                    >download it</a>
                </div>
 
                <ModalView show={this.state.modalShowMnemonicPhrase}
                           size={'xl'}
                           heading={'mnemonic phrase'}
                           on_close={() => this.changeMnemonicModalShow(false)}
                           body={                            
                            <MnemonicView mnemonic={this.state.mnemonic}/>
                           }/>

            </div>
            
        );
    }
}


export default ActionView;
