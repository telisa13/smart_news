import React from 'react';
import {render} from 'react-dom';

class App extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      isLogin: true,
      email: '',
      name: '',
      password: ''
    };
  }

  onChange(type, val){
    val = val.target.value;
    switch (type){
      case 'email':
        this.setState({email: val});
        break;

      case 'password':
        this.setState({password: val});
        break;

      case 'name':
        this.setState({name: val});
        break;
    }
  }



  render(){

    const {isLogin, email, name, password} = this.state;

    const renderForm = isLogin ?
      <form id="signin"
            autoComplete="off"
            name="signin"
            method="post"
            action="/auth/login"
            className="auth_form">
        <h1>Вход</h1>

        <label htmlFor="email">
          <input className="text" name="email" onChange={(e)=>this.onChange('email', e)} value={email} type="text" placeholder="E-mail" maxLength={100} />
        </label>

        <label htmlFor="password">
          <input name="password" type="password" onChange={(e)=>this.onChange('password', e)} value={password} placeholder="Пароль" maxLength={100} />
        </label>

        <input className="btn" type="submit" value="Продолжить" />
      </form>
      :
      <form id="signup"
            autoComplete="off"
            name="register"
            method="post"
            action="/auth/register"
            className="auth_form">
        <h1>Регистрация</h1>
        <label htmlFor="email">
          <input className="text" name="email" value={email} onChange={(e)=>this.onChange('email', e)} type="email" placeholder="E-mail" maxLength={100} />

        </label>
        <label htmlFor="name">
          <input name="name" type="text" value={name} onChange={(e)=>this.onChange('name', e)} placeholder="Псевдоним" maxLength={100}/>

        </label>
        <label htmlFor="password">
          <input name="password" type="password" value={password} onChange={(e)=>this.onChange('password', e)} placeholder="Пароль" maxLength={100}/>

        </label>
        <input className="btn" type="submit" value="Продолжить" />
      </form>;


    return (    <div className="auth_div">

      <div className="auth_forms">

        {renderForm}

      </div>

      <div className="auth_buttons">
        <div className="btnSwitch"
             onClick={()=>this.setState(prevState=>{return {isLogin: !prevState.isLogin}})}>{isLogin? 'Еще нет аккаунта? Зарегистрируйтесь!': 'Перейти кo входу'}</div>
      </div>

    </div>);
  }
}

render(
  <App/>,
  document.getElementById('auth_app'));