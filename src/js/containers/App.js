import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import  Actions from '../actions';
import Header from '../components/Header/Header.jsx';
import Manager from '../components/Manager/Manager.jsx';
import Map from '../components/Map/Map.jsx';
import Setting from '../components/Setting/Setting.jsx';

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { sources, samples, config, visibility, modal, process, actions } = this.props;
        return (
            <div className="container">
                <Header visibility={visibility} modal={modal} actions={actions} />
                <Manager sources={sources} samples={samples} process={process} visibility={visibility} actions={actions} />
                <Setting config={config} modal={modal} actions={actions} />
                <Map sources={sources} config={config} actions={actions} />
                <div className="container-cover" style={{display: process.isRunning ? 'block' : 'none'}} />
            </div>
        );
    }
}

App.propTypes = {
    sources: PropTypes.array.isRequired,
    samples: PropTypes.array.isRequired,
    config: PropTypes.object.isRequired,
    visibility: PropTypes.bool.isRequired,
    modal: PropTypes.bool.isRequired,
    process: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
};

const mapStateToProps = function(state) {
    return {
        sources: state.sources,
        samples: state.samples,
        config: state.config,
        visibility: state.visibility,
        modal: state.modal,
        process: state.process
    };
};

const mapDispatchToProps = function(dispatch) {
    return { actions: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
