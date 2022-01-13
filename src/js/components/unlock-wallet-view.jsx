import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button, Col, Container, FormControl, Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api/index';
import {unlockWallet, walletReady} from '../redux/actions';

const styles           = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    }
};
const UnlockWalletView = (props) => {
    if (props.wallet.unlocked) {
        const {from} = props.location.state || {from: {pathname: '/'}};
        return <Redirect to={from}/>;
    }
    else if (props.wallet.isNew) {
        return <Redirect to={{pathname: '/new-wallet/'}}/>;
    }

    const goToWalletView = (walletInfo) => {
        props.unlockWallet(walletInfo);
        props.history.replace('/');
    };

    let passphraseRef;

    const walletUnlockWithPassword = (password) => {
        API.newSession(password)
           .then(data => {
               if (data.api_status === 'fail') {
                   return;
               }
               goToWalletView(data.wallet);
           }).catch(_ => props.walletReady({authenticationError: true}));
    };

    return (
        <Container style={{
            marginTop  : 50,
            paddingLeft: 25
        }}>
            <div className="container-center lg" style={{marginTop: '5%'}}>
                <div className="view-header">
                    <div className="header-icon">
                        <i className="pe page-header-icon pe-7s-unlock"/>
                    </div>
                    <div className="header-title">
                        <h3>millix</h3>
                        <small>
                            please enter your password to unlock your wallet.
                        </small>
                    </div>
                </div>

                <div className="panel panel-filled">
                    <div className="panel-body">

                        <div className="form-group">
                            <label htmlFor="password">password</label>
                            <FormControl
                                ref={c => passphraseRef = c}
                                type="password"
                                placeholder="wallet password"
                                aria-label="wallet password"
                                aria-describedby="basic-addon"
                                onKeyPress={(e) => {
                                    if (e.charCode === 13) {
                                        walletUnlockWithPassword(passphraseRef.value);
                                    }
                                }}
                            />
                            {props.wallet.authenticationError ? (
                                <span className="help-block small">there was a problem authenticating your key file. retry your password or <a
                                    style={{cursor: 'pointer'}}
                                    onClick={() => props.history.push('/import-wallet/')}> click here to load your key.</a></span>) : (
                                 <span className="help-block small">Your strong password</span>)}
                        </div>
                        <Row>
                            <Col style={styles.centered}>
                                <Button variant='outline-primary'
                                        onClick={() => walletUnlockWithPassword(passphraseRef.value)}> login </Button>
                            </Col>
                        </Row>

                    </div>
                </div>
            </div>
            {props.wallet.notification_message && (props.wallet.notification_message.is_sticky || props.wallet.notification_message.timestamp + 10000 >= Date.now()) &&
             props.wallet.notification_message.message.split('\n').map((message, idx) =>
                 <Row key={'message_' + idx}>
                     <Col style={{
                         ...styles.centered,
                         marginTop: idx === 0 ? 30 : 0
                     }}>
                         <small>
                             {message}
                         </small>
                     </Col>
                 </Row>)}
            <div className="container-center lg" style={{marginTop: 0}}>
                <Row>
                    <Col sm={6} style={{textAlign: 'right'}}>
                        <Button variant='outline-primary'
                                onClick={() => props.history.push('/new-wallet/')}>
                            <FontAwesomeIcon icon="wallet" size="8x"
                                             style={{
                                                 margin : '0 auto',
                                                 display: 'block'
                                             }}/> new wallet
                        </Button>
                    </Col>
                    <Col sm={6}>
                        <Button variant='outline-primary'
                                onClick={() => props.history.push('/import-wallet/')}>
                            <FontAwesomeIcon icon="key" size="6x"
                                             style={{
                                                 margin : '0 auto',
                                                 display: 'block'
                                             }}/> import wallet
                        </Button>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

export default connect(
    state => ({
        wallet: state.wallet
    }),
    {
        unlockWallet,
        walletReady
    }
)(UnlockWalletView);
