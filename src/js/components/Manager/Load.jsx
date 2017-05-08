import React from 'react';
import PropTypes from 'prop-types';
import Validation from '../../constants/Validation.js';

export default class Load extends React.Component{
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleClick(ev) {
        const { loader } = this.refs;
        const evt = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
        loader.dispatchEvent(evt);
    }

    handleChange(ev) {
        const { actions } = this.props;
        const file = ev.target.files[0];
        const reader = new FileReader();
        reader.onload = function(ev) {
            const format = new Validation(reader.result);
            actions.addSource(file.name, format.getResult(), format.getProperties());
        };
        reader.readAsText(file, 'UTF-8');
        ev.target.value = '';
    }

    render() {
        const styles = { display: 'none' };
        return (
            <div className="manager-load">
              <span onClick={this.handleClick}>Source Add +</span>
              <input ref="loader" type="file" style={styles} onChange={this.handleChange} />
            </div>
        );
    }
}

Load.propTypes = {
    actions: PropTypes.object.isRequired
};
