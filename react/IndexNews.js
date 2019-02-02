import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import NewsGrid from "./NewsGrid/App";
import NewsGridStore from './NewsGrid/store';


render(
  <Provider store={NewsGridStore}>
    <NewsGrid url="/news"/>
  </Provider>,
  document.getElementById('news_app'));