import {createStore, applyMiddleware} from 'redux';

import reducer from './reducer';
// import rPromise from 'redux-promise-middleware';
import thunk from 'redux-thunk';

// store: reducer and начальное состояние store
export default createStore(
  reducer,
  {link:'', page:1, news:[]},
  applyMiddleware(thunk)
);