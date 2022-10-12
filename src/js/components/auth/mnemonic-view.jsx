import React from 'react';
import PropTypes from 'prop-types';
import {Col, Form, FormControl, InputGroup, Row} from 'react-bootstrap';
import Translation from '../../common/translation';

const MnemonicView = (props) => {
    return (
        <div className={'mnemonic'}>
            <div className={'mb-3'}>
                {Translation.getPhrase('6bf163d02')}
            </div>
            <Form.Group>
                <label>{Translation.getPhrase('01f11055b')}</label>
                <Form.Control type="text"
                              placeholder={Translation.getPhrase('b8b4deaaf')}
                              value={props.mnemonic.join(' ')}
                              readOnly={true}/>
            </Form.Group>
        </div>
    );
};

MnemonicView.propTypes = {
    mnemonic: PropTypes.array.isRequired
};

export default MnemonicView;
