import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import { UserIsAuthenticated } from './util/wrappers.js'

// Layouts
import App from './App'
import Home from './layouts/home/Home'
import Dashboard from './layouts/dashboard/Dashboard'
import Profile from './user/layouts/profile/Profile'
import Find from './layouts/find/Find'

// Redux Store
import store from './store'

const history = syncHistoryWithStore(browserHistory, store)

const user = JSON.parse(localStorage.getItem('credentials'))
if(user) {
  store.dispatch({
    type: 'USER_LOGGED_IN',
    payload: user
  });
}

ReactDOM.render((
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home} />
          <Route path="find" component={UserIsAuthenticated(Find)} />
          <Route path="dashboard" component={UserIsAuthenticated(Dashboard)} />
          <Route path="profile" component={UserIsAuthenticated(Profile)} />
        </Route>
      </Router>
    </Provider>
  ),
  document.getElementById('root')
)
