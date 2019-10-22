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
actions.attemptLogin = (credentials, history)=> {
  return async(dispatch)=> {
    const auth = (await axios.post('/api/sessions', credentials)).data;
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
  constructor(){
    super();
    this.state = {
      email: '',
      password: '',
      error: ''
    };
    this.onChange = this.onChange.bind(this);
    this.attemptLogin = this.attemptLogin.bind(this);
  }
  attemptLogin(ev){
    ev.preventDefault();
    const credentials = {...this.state};
    delete credentials.error;
    this.props.attemptLogin(credentials)
      .catch(ex => this.setState({ error: 'bad credentials'}));
  }
  onChange(ev){
    this.setState({[ev.target.name]: ev.target.value });
  }
  render(){
    const { error, email, password } = this.state;
    const { onChange, attemptLogin } = this;
    return (
        <form>
          {
            error && <div className='error'>{ error }</div>
          }
          <div>
            <label>Email</label>
            <input name='email' value={ email } onChange={ onChange } />
          </div>
          <div>
            <label>Password</label>
            <input type='password' name='password' value={ password } onChange={ onChange } />
          </div>
          <button onClick={ attemptLogin }>Login</button>
        </form>
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
  Home - Welcome { auth.email }
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
        <h1>Acme Login</h1>
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
