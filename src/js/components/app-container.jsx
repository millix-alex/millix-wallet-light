import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {Provider} from 'react-redux';
import PropTypes from 'prop-types';
import WalletView from './wallet-view';
import ImportWalletView from './import-wallet-view';
import UnlockWalletView from './unlock-wallet-view';
import UnlockedWalletRequiredRoute from './utils/unlocked-wallet-required-route';
import TransactionHistoryView from './transaction-history-view';
import UnspentTransactionOutputView from './unspent-transaction-output-view';
import TransactionDetails from './transaction-details-view';
import PeerListView from './peer-list-view';
import PeerInfoView from './peer-info-view';
import AdvertisementFormView from './advertisement/advertisement-form-view';
import AdvertisementListView from './advertisement/advertisement-list-view';
/*
 import EventLogView from './event-log-view';
 */
import ActionView from './action-view';
import NewWalletView from './new-wallet-view';
import ManageWalletView from './manage-wallet-view';
import StatsView from './stats-view';
import BacklogView from './backlog-view';
import ReportIssueView from './report-issue-view';
import FaqView from './faq-view';
import AddressListView from './address-list-view';
import ConfigGeneralView from './config/config-general-view';
import ConfigNetwork from './config/config-network-view';
import ConfigConnection from './config/config-connection-view';
import ConfigConsensus from './config/config-consensus-view';
import ConfigStorage from './config/config-storage-view';
import ConfigAddressVersion from './config/config-address-version-view';
import ErrorModalRequestApi from './utils/error-handler-request-api';
import AdvertisementConsumerSettlementLedgerView from './advertisement/advertisement-consumer-settlement-ledger-view';
import EventsLogView from './event-log-view';
import MessageNewView from './msg-send-view';
import MessageReceivedView from './msg-received-list-view';
import MessageSentView from './msg-sent-list-view';
import MessageView from './msg-view';


class AppContainer extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return <Provider store={this.props.store}>
            <Router>
                <ErrorModalRequestApi/>
                <Switch>
                    <Route path="/unlock/" component={UnlockWalletView}/>
                    <Route path="/manage-wallet/" component={ManageWalletView}/>
                    <Route path="/new-wallet/" component={NewWalletView}/>
                    <Route path="/import-wallet/" component={ImportWalletView}/>

                    <UnlockedWalletRequiredRoute path="/advertisement-form"
                                                 component={AdvertisementFormView}/>
                    <UnlockedWalletRequiredRoute path="/advertisement-list"
                                                 component={AdvertisementListView}/>
                    <UnlockedWalletRequiredRoute path="/advertisement-deposit-list"
                                                 component={AdvertisementConsumerSettlementLedgerView}/>
                    <UnlockedWalletRequiredRoute path="/peers"
                                                 component={PeerListView}/>
                    <UnlockedWalletRequiredRoute path="/event-log"
                                                 component={EventsLogView}/>
                    <UnlockedWalletRequiredRoute path="/peer/:peer"
                                                 component={PeerInfoView}/>
                    <UnlockedWalletRequiredRoute path="/config/general"
                                                 component={ConfigGeneralView}/>
                    <UnlockedWalletRequiredRoute path="/config/network"
                                                 component={ConfigNetwork}/>
                    <UnlockedWalletRequiredRoute path="/config/connection"
                                                 component={ConfigConnection}/>
                    <UnlockedWalletRequiredRoute path="/config/consensus"
                                                 component={ConfigConsensus}/>
                    <UnlockedWalletRequiredRoute path="/config/storage"
                                                 component={ConfigStorage}/>
                    <UnlockedWalletRequiredRoute path="/config/address-version"
                                                 component={ConfigAddressVersion}/>
                    <UnlockedWalletRequiredRoute path="/config"
                                                 component={ConfigView}/>
                    <UnlockedWalletRequiredRoute path="/message-new"
                                                 component={MessageNewView}/>
                    <UnlockedWalletRequiredRoute path="/message-view"
                                                 component={MessageView}/>
                    <UnlockedWalletRequiredRoute path="/message-received"
                                                 component={MessageReceivedView}/>
                    <UnlockedWalletRequiredRoute path="/message-sent"
                                                 component={MessageSentView}/>

                    {/*<UnlockedWalletRequiredRoute path='/log'*/}
                    {/*                             component={EventLogView}/>*/}

                    <UnlockedWalletRequiredRoute path="/actions"
                                                 component={ActionView}/>
                    <UnlockedWalletRequiredRoute path="/status-summary"
                                                 component={StatsView}/>
                    <UnlockedWalletRequiredRoute path="/backlog"
                                                 component={BacklogView}/>

                    <UnlockedWalletRequiredRoute path="/report-issue"
                                                 component={ReportIssueView}/>

                    <UnlockedWalletRequiredRoute
                        path="/transaction/:transaction_id"
                        component={TransactionDetails}/>
                    <UnlockedWalletRequiredRoute path="/address-list"
                                                 component={AddressListView}/>
                    <UnlockedWalletRequiredRoute path="/transaction-list"
                                                 component={TransactionHistoryView}/>
                    <UnlockedWalletRequiredRoute path="/faq"
                                                 component={FaqView}/>
                    <UnlockedWalletRequiredRoute
                        path="/unspent-transaction-output-list/:state"
                        component={UnspentTransactionOutputView}/>
                    <UnlockedWalletRequiredRoute component={WalletView}/>
                </Switch>
            </Router>
        </Provider>;
    }
}


AppContainer.propTypes = {
    store: PropTypes.object.isRequired
};

export default AppContainer;
