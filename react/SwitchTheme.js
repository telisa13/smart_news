import React from 'react';
import {render} from 'react-dom';
import Switch from './Switch';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value : true,
      input: null
    }
  }

  componentDidMount(){
    const input = document.getElementById('input_theme');
    const value = parseInt(input.value) === 0 ? true : false;
    this.setState({value, input});
  }


  changeHandler(e) {
    this.state.input.value = e ? 0 : 1;
    this.setState({value: e}, ()=>{
      document.getElementById('profile').submit();
    });
  }

  render(){
    const {value} = this.state;
    return (
      <div style={{marginTop: '20px'}}>
        <Switch value={value} setValue={true} text1="Светлая тема" text2="Темная тема" onChange={(e)=>this.changeHandler(e)}/>
      </div>
      );
  }
}

render( <App/>,
  document.getElementById('switch_theme_app'));