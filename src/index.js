import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider, connect } from 'react-redux';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import axios from 'axios';

/* STORE */
const store = createStore(
    combineReducers({
      auth: (state={}, action)=> {
        if(action.type === 'SET_AUTH'){
          return action.auth;
        }
        return state;
      }
    }),
    applyMiddleware(thunk)
);

const actions = {};
actions.attemptLogin = (username, history)=> {
  return async(dispatch)=> {
    const auth = (await axios.post('/api/sessions', { username })).data;
    dispatch({ type: 'SET_AUTH', auth});
    history.push('/');
  };
};

actions.attemptSessionLogin = ()=> {
  return async(dispatch)=> {
    const auth = (await axios.get('/api/sessions')).data;
    dispatch({ type: 'SET_AUTH', auth});
  };
};

actions.logout = ()=> {
  return async(dispatch)=> {
    await axios.delete('/api/sessions');
    dispatch({ type: 'SET_AUTH', auth: {}});
  };
};

/* Login */
class _Login extends Component{
  render(){
    const { attemptLogin } = this.props;
    return (
        <div>
          <button onClick={ ()=> attemptLogin('moe')}>Login As Moe</button>
          <button onClick={ ()=> attemptLogin('lucy')}>Login As Lucy</button>
        </div>
    );
  }
}

const Login = connect(
  ()=> {
    return {

    };
  },
  (dispatch, { history })=> {
    return {
      attemptLogin: (username)=> dispatch(actions.attemptLogin(username, history))
    }
  }
)(_Login);


/* Home */
const _Home = ({ auth, logout })=> <div>
  Home - Welcome { auth.name }
  <button onClick={ logout }>Logout</button>
</div>;

const Home = connect(
    ({ auth })=> {
      return { auth }
    },
    (dispatch)=> {
      return {
        logout: ()=> dispatch(actions.logout())
      }
    }
)(_Home);

/* App */
class _App extends Component{
  componentDidMount(){
    this.props.attemptSessionLogin()
      .catch(ex => console.log(ex));
  }
  render(){
    const { loggedIn } = this.props;
    return (
      <div>
        <HashRouter>
          <Switch>
          {
            loggedIn && (<Route path='/' component= { Home } exact/>)
          }
          {
            !loggedIn && (<Route path='/login' component= { Login } exact/>)
          }
          {
            !loggedIn && <Redirect to='/login' />
          }
          {
            loggedIn && <Redirect to='/' />
          }
          </Switch>
        </HashRouter>
      </div>
    );
  }
};

const App = connect(
    ({ auth })=> {
      return {
        loggedIn: !!auth.id
      };
    },
    (dispatch)=> {
      return {
        attemptSessionLogin: ()=> dispatch(actions.attemptSessionLogin())
      };
    }
)(_App);

render(<Provider store={ store }><App /></Provider>, document.querySelector('#root'));
