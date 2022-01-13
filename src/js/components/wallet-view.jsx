import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Row, Form, Table, Button, Badge} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {MDBDataTable as DataTable} from 'mdbreact';
import API from '../api/index';
import _ from 'lodash';

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


class WalletView extends Component {
    constructor(props) {
        super(props);
        this.state              = {
            feesLocked : true,
            addressList: []
        };
        this.addressListColumns = [
            {
                label: '#',
                field: 'address_position',
                width: 150
            },
            {
                label: [
                    <FontAwesomeIcon icon="book" size="1x"/>,
                    ' address'
                ],
                field: 'address',
                width: 270
            }
        ];
    }

    componentDidMount() {
        this.updateAddresses();
    }

    componentWillUnmount() {
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
        }
    }

    updateAddresses() {
        API.listAddresses(this.props.wallet.address_key_identifier)
           .then(addresses => {
               this.setState({
                   addressList: {
                       columns: this.addressListColumns,
                       rows   : _.sortBy(_.map(addresses, address => _.pick(address, [
                           'address',
                           'address_position'
                       ])), address => -address.address_position)
                   }
               });
           });
    }

    getNextAddress() {
        API.getNextAddress()
           .then(() => this.updateAddresses());
    }

    _getAmount(value, allowZero = false) {
        const pValue = parseInt(value.replace(/[,.]/g, ''));
        if ((allowZero ? pValue < 0 : pValue <= 0) || pValue.toLocaleString('en-US') !== value) {
            throw Error('invalid_value');
        }
        return pValue;
    }

    send() {

        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
            this.setState({
                canceling: true
            });
            return;
        }

        this.setState({
            sendTransactionError       : false,
            sendTransactionErrorMessage: null
        });

        API.verifyAddress(this.destinationAddress.value.trim())
           .then(data => {
               if (!data.is_valid) {
                   this.setState({addressError: true});
                   return Promise.reject('invalid transaction');
               }

               const {
                         address_base          : destinationAddress,
                         address_key_identifier: destinationAddressIdentifier,
                         address_version       : destinationAddressVersion
                     } = data;

               let amount;
               try {
                   amount = this._getAmount(this.amount.value);
               }
               catch (e) {
                   this.setState({
                       amountError : true,
                       addressError: false
                   });
                   return Promise.reject('invalid transaction');
               }

               let fees;
               try {
                   fees = this._getAmount(this.fees.value, true);
               }
               catch (e) {
                   this.setState({
                       feeError    : true,
                       amountError : false,
                       addressError: false
                   });
                   return Promise.reject('invalid transaction');
               }

               this.setState({
                   addressError: false,
                   amountError : false,
                   feeError    : false,
                   sending     : true
               });

               return API.sendTransaction({
                   transaction_output_list: [
                       {
                           address_base          : destinationAddress,
                           address_version       : destinationAddressVersion,
                           address_key_identifier: destinationAddressIdentifier,
                           amount
                       }
                   ],
                   transaction_output_fee : {
                       fee_type: 'transaction_fee_default',
                       amount  : fees
                   }
               }).then(data => {
                   console.log(data);
                   if (data.api_status === 'fail') {
                       return Promise.reject(data);
                   }
               });
           })
           .then(() => {
               this.destinationAddress.value = '';
               this.amount.value             = '';
               if (this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
                   this.fees.value = this.props.config.TRANSACTION_FEE_DEFAULT.toLocaleString('en-US');
               }
               this.setState({
                   sending   : false,
                   feesLocked: true
               });
           })
           .catch((e) => {
               let sendTransactionErrorMessage;
               if (e.api_message) {
                   const match                 = /unexpected generic api error: \((?<message>.*)\)/.exec(e.api_message);
                   sendTransactionErrorMessage = `your transaction could not be sent: (${match.groups.message})`;
               }
               else if (e === 'insufficient_balance') {
                   sendTransactionErrorMessage = 'your transaction could not be sent: insufficient millix balance';
               }
               else if (e === 'transaction_send_interrupt') {
                   sendTransactionErrorMessage = 'your transaction could not be sent: your transaction was canceled';
               }
               else {
                   sendTransactionErrorMessage = `your transaction could not be sent: (${e.message || e.api_message || e})`;
               }

               console.log(e);
               this.setState({
                   sendTransactionError: true,
                   sending             : false,
                   canceling           : false,
                   sendTransactionErrorMessage
               });
           });
    }

    handleAmountValueChange(e) {
        if (e.target.value.length === 0) {
            return;
        }

        let cursorStart = e.target.selectionStart,
            cursorEnd   = e.target.selectionEnd;
        let amount      = e.target.value.replace(/[,.]/g, '');
        let offset      = 0;
        if ((amount.length - 1) % 3 === 0) {
            offset = 1;
        }

        amount         = parseInt(amount);
        e.target.value = !isNaN(amount) ? amount.toLocaleString('en-US') : 0;

        e.target.setSelectionRange(cursorStart + offset, cursorEnd + offset);
    }

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>balance
                            </div>
                            <hr className={'hrPanel'}/>
                            <div className={'panel-body'}>
                                <div className={'d-flex'}>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th width="50%">available</th>
                                            <th width="50%">pending</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr key="1" className="wallet-address">
                                            <td>
                                                {this.props.wallet.balance_stable.toLocaleString('en-US')}
                                                <span
                                                    style={{
                                                        float : 'right',
                                                        cursor: 'pointer'
                                                    }}>
                                                <Button
                                                    variant="outline-primary"
                                                    className={'btn-xs icon_only'}
                                                    onClick={() => this.props.history.push('/utxo/stable', {stable: 1})}>
                                                        <FontAwesomeIcon
                                                            icon={'list'}
                                                            size="1x"/>
                                                    </Button>
                                            </span>
                                            </td>
                                            <td>
                                                {this.props.wallet.balance_pending.toLocaleString('en-US')}
                                                <span
                                                    style={{
                                                        float : 'right',
                                                        cursor: 'pointer'
                                                    }}>
                                                <Button
                                                    variant="outline-primary"
                                                    className={'btn-xs icon_only'}
                                                    onClick={() => this.props.history.push('/utxo/pending', {stable: 0})}>
                                                        <FontAwesomeIcon
                                                            icon={'list'}
                                                            size="1x"/>
                                                    </Button>
                                            </span></td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>send</div>
                            <hr className={'hrPanel'}/>
                            <div className={'panel-body'}>
                                <Row className="mb-3">
                                    <Form>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>address</label>
                                                <Form.Control type="text"
                                                              placeholder="address"
                                                              ref={c => this.destinationAddress = c}/>
                                                {this.state.addressError && (
                                                    <Form.Text
                                                        className="text-muted"><small>invalid
                                                        address.
                                                        please, set a correct
                                                        value.</small></Form.Text>)}
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>amount</label>
                                                <Form.Control type="text"
                                                              placeholder="amount"
                                                              pattern="[0-9]+([,][0-9]{1,2})?"
                                                              ref={c => this.amount = c}
                                                              onChange={this.handleAmountValueChange.bind(this)}/>
                                                {this.state.amountError && (
                                                    <Form.Text
                                                        className="text-muted"><small>invalid
                                                        amount.
                                                        please, set a correct
                                                        value.</small></Form.Text>)}
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group"
                                                        as={Row}>
                                                <label>fee</label>
                                                <Col md={11} ms={11}>
                                                    <Form.Control type="text"
                                                                  placeholder="fee"
                                                                  pattern="[0-9]+([,][0-9]{1,2})?"
                                                                  ref={c => {
                                                                      this.fees = c;
                                                                      if (this.fees && !this.feesInitialized && this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
                                                                          this.feesInitialized = true;
                                                                          this.fees.value      = this.props.config.TRANSACTION_FEE_DEFAULT.toLocaleString('en-US');
                                                                      }
                                                                  }}
                                                                  onChange={this.handleAmountValueChange.bind(this)}
                                                                  disabled={this.state.feesLocked}/>
                                                </Col>
                                                <Col style={styles.centered}
                                                     md={1} ms={1}>
                                                    <Button
                                                        variant="outline-primary"
                                                        onClick={() => this.setState({feesLocked: !this.state.feesLocked})}>
                                                        <FontAwesomeIcon
                                                            icon={this.state.feesLocked ? 'lock' : 'lock-open'}
                                                            size="1x"/>
                                                    </Button>
                                                </Col>
                                                {this.state.feeError && (
                                                    <Form.Text
                                                        className="text-muted"><small
                                                        style={{color: 'red'}}>invalid
                                                        fee.
                                                        please, set a correct
                                                        value.</small></Form.Text>)}
                                            </Form.Group>
                                        </Col>
                                        <Col style={styles.centered}>
                                            <Form.Group as={Row}
                                                        className={'submit-row'}>
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={this.send.bind(this)}
                                                    disabled={this.state.canceling}>
                                                    {this.state.sending ?
                                                     <>
                                                         <div style={{
                                                             fontSize: '6px',
                                                             float   : 'left'
                                                         }}
                                                              className="loader-spin"/>
                                                         {this.state.canceling ? 'canceling' : 'cancel transaction'}
                                                     </> : <>send millix</>}
                                                </Button>
                                            </Form.Group>
                                        </Col>
                                        <Col style={styles.centered}>
                                            {this.state.sendTransactionError && (
                                                <span>{this.state.sendTransactionErrorMessage}</span>)}
                                        </Col>
                                    </Form>
                                </Row>
                            </div>
                        </div>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>addresses
                            </div>
                            <hr className={'hrPanel'}/>
                            <div className={'panel-body'}>
                                <Row className="mb-3 mt-3">
                                    <Col className="pr-0" style={{
                                        display       : 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button variant="outline-primary"
                                                onClick={() => this.getNextAddress()}>
                                            generate address
                                        </Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <DataTable striped bordered small hover
                                               info={false}
                                               entries={10}
                                               entriesOptions={[
                                                   10,
                                                   30,
                                                   50
                                               ]}
                                               data={this.state.addressList}/>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet,
        config: state.config
    }))(withRouter(WalletView));
