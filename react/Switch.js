import React from 'react';
import {render} from 'react-dom';

export default class App extends React.Component{

  constructor(props){
    super(props);
    const {value, setValue} = this.props;
    if(setValue){
      this.state = { value : value };
    }
    else {
      this.state = { value: true};

    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.setValue){
      this.setState({value: nextProps.value})
    }
  }

  handleChange(e){
    this.setState(prevState => {

      return{value: !prevState.value}
    }, () => {
      this.props.onChange(this.state.value);
    })
  }

  render(){
    const {value} = this.state;
    const {text1, text2} = this.props;
    return (
      <div className="switch_app">
        <div className="switch_app_inner">
          {value ?
            <div className="switch_button selected">{text1}</div> :
            <div className="switch_button clickable" onClick={(e)=>this.handleChange(e)}>{text1}</div>}
          {!value ?
            <div className="switch_button selected">{text2}</div>:
            <div className="switch_button clickable" onClick={(e)=>this.handleChange(e)}>{text2}</div>}
        </div>
      </div>);
  }
}
