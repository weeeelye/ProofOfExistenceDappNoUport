import { uport } from './../../../util/connectors.js'
import { browserHistory } from 'react-router'

export const USER_LOGGED_IN = 'USER_LOGGED_IN'
function userLoggedIn(user) {

  return {
    type: USER_LOGGED_IN,
    payload: user
  }
}

export function loginUser() {
  return function(dispatch) {
    uport.requestCredentials({requested: ['name', 'country'],
      notifications: true}).then((credentials) => {
      dispatch(userLoggedIn(credentials))

      localStorage.setItem('credentials', JSON.stringify(credentials));

      var currentLocation = browserHistory.getCurrentLocation()

      if ('redirect' in currentLocation.query)
      {
        return browserHistory.push(decodeURIComponent(currentLocation.query.redirect))
      }

      return browserHistory.push('/dashboard')
    })
  }
}
