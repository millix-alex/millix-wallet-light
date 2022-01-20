import React, {Component} from 'react';
import SideNav, {NavItem, NavText} from '@trendmicro/react-sidenav';
import {connect} from 'react-redux';
import {lockWallet} from '../redux/actions/index';
import moment from 'moment';


class Sidebar extends Component {
    constructor(props) {
        super(props);
        let now            = Date.now();
        this.state         = {
            fileKeyExport: 'export_' + now,
            fileKeyImport: 'import_' + now,
            date: new Date()
        };
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({
            date: new Date()
        });
    }

    highlightSelected(defaultSelected) {

        if (defaultSelected.startsWith('/transaction/')) {
            defaultSelected = '/history';
        }
        else if (defaultSelected.startsWith('/utxo/') || defaultSelected === '/') {
            defaultSelected = '/wallet';
        }
        else if (defaultSelected.startsWith('/peer/')) {
            defaultSelected = '/peers';
        }

        return defaultSelected;
    }

    render() {
        let props           = this.props;
        let defaultSelected = this.highlightSelected(props.location.pathname);

        return (<aside className={'navigation'} style={{
            height   : '100%',
            minHeight: '100vh'
        }}>
            <SideNav
                expanded={true}
                onToggle={() => {
                }}
                onSelect={(selected) => {
                    switch (selected) {
                        case 'lock':
                            props.lockWallet();
                            break;
                        case 'resetValidation':
                            break;
                        default:
                            props.history.push(selected);
                    }

                    if (props.location.pathname !== selected) {
                        props.history.push(selected);
                    }
                }}
            >
                <div className="nav-utc_clock">
                    <span>{moment.utc(this.state.date).format('YYYY-MM-DD HH:mm:ss')} utc</span>
                </div>
                <SideNav.Nav
                    selected={defaultSelected}
                >
                    <NavItem key={'wallet'} eventKey="/wallet">
                        <NavText>
                            home
                        </NavText>
                    </NavItem>
                    <NavItem key={'history'} eventKey="/history">
                        <NavText>
                            transactions
                        </NavText>
                    </NavItem>
                    <NavItem key={'peers'} eventKey="/peers">
                        <NavText>
                            peers
                        </NavText>
                    </NavItem>
                    {/*
                     <NavItem key={'log'} eventKey="/log">
                     <NavText>
                     logs
                     </NavText>
                     </NavItem>
                     */}
                    <NavItem key={'config'} eventKey="/config">
                        <NavText>
                            settings
                        </NavText>
                    </NavItem>
                    <NavItem key={'actions'} eventKey="/actions">
                        <NavText>
                            actions
                        </NavText>
                    </NavItem>
                    <NavItem key={'status'} eventKey="/status">
                        <NavText>
                            status
                        </NavText>
                    </NavItem>
                    <NavItem eventKey="ads">
                        <NavText>
                            ads
                        </NavText>
                        <NavItem key={'create-ad'} eventKey="/create-ad">
                            <NavText>
                                create
                            </NavText>
                        </NavItem>
                        <NavItem key={'list-ad'} eventKey="/list-ad">
                            <NavText>
                                list
                            </NavText>
                        </NavItem>
                    </NavItem>
                    <NavItem key={'lock'} eventKey="lock">
                        <NavText>
                            logout
                        </NavText>
                    </NavItem>
                </SideNav.Nav>
                <div className='nav-info'>
                     <span>version {props.node.node_version}</span>
                     </div>
            </SideNav>
        </aside>);
    }
}


export default connect(
    state => state,
    {lockWallet}
)(Sidebar);
