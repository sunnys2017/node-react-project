import 'materialize-css/dist/css/materialize.min.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';

import App from './components/App';
import reducers from './reducers';

//Below two lines of code is temporary for testing
//Development only axios helpers.
import axios from ‘axios’;
window.axios = axios;


const store = createStore(reducer, {}, applyMiddleware(reduxThunk));

ReactDOM.render(
    <Provider store={store}><App /></Provider>, 
    document.querySelect('#root')
);
