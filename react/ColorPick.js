import React from 'react';
import {render} from 'react-dom';
import 'rc-color-picker/assets/index.css';
import ColorPicker from 'rc-color-picker';

class App extends React.Component {
  constructor(props){
    super(props);

    const r = this.getRandomInt(0,256);
    const g = this.getRandomInt(0,256);
    const b = this.getRandomInt(0,256);

    this.state = {
      color: `rgba(${r},${g},${b},1)`
    };

  }

  componentDidMount(){
    const input = document.getElementById('input_color');
    this.setState({color: input.value})
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  changeHandler(colors) {
    this.setState({color: colors.color}, () => {
      const input = document.getElementById('input_color');
      input.value = colors.color;
    })
  }

  render(){
    return (
      <div>
        <ColorPicker
          animation="slide-up"
          color={this.state.color}
          onChange={(c) => this.changeHandler(c)}
        />
      </div>);
  }
}

render( <App/>,
  document.getElementById('color_pick_app'));