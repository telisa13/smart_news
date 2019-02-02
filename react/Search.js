import React from 'react';
import {render} from 'react-dom';
import ReactSVG from 'react-svg';

// import App from "./containers/App";
class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {value:'Введите запрос', start: 'Введите запрос'};

    // submit form
    this.handleSubmit = this.handleSubmit.bind(this);

    // search icon click
    this.handleClick = this.handleClick.bind(this);

    // voice input
    this.handleSpeak = this.handleSpeak.bind(this);

    // input change
    this.handleChange = this.handleChange.bind(this);

    this.recognizer = new webkitSpeechRecognition();
    this.recognizer.interimResults = true;
    this.recognizer.lang = 'ru-RU';
    this.recognizer.onresult = e =>{
      let result = e.results[e.resultIndex];

      if(result.isFinal){
        // this.input.value = result[0].transcript;
        this.setState({value: result[0].transcript})
      }
      else {
        console.log(result[0].transcript)
      }
    }

  }
  componentDidMount(){
    fetch('/search/get')
    .then(res => res.json())
    .then(response=>{
      if(response.status){
        this.setState({value: response.data, start: response.data});
      }
    });


  }
  handleSubmit(event) {
    event.preventDefault();
    this.handleClick();
  }

  handleClick(){
    document.location.href=`/search?q=${this.state.value.length === 0 ? this.state.start : this.state.value}`;
  }

  handleChange(e){

    // удаляем пунктуацию и цифры
    let value = e.target.value.replace(/[0-9.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    this.setState({value: value})
  }

  handleSpeak(e){
    this.recognizer.start();
  }

  render(){
    const s = this.state.start;
    const v = this.state.value;

    return (
        <form action="/search" className="page_search" onSubmit={this.handleSubmit} ref={form=>this.form = form}>

          {/*<!-- search icon -->*/}
          <svg className="active" title="Найти" onClick={this.handleClick} viewBox="0 0 52.966 52.966">
            <path d="M51.704,51.273L36.845,35.82c3.79-3.801,6.138-9.041,6.138-14.82c0-11.58-9.42-21-21-21s-21,9.42-21,21s9.42,21,21,21
	c5.083,0,9.748-1.817,13.384-4.832l14.895,15.491c0.196,0.205,0.458,0.307,0.721,0.307c0.25,0,0.499-0.093,0.693-0.279
	C52.074,52.304,52.086,51.671,51.704,51.273z M21.983,40c-10.477,0-19-8.523-19-19s8.523-19,19-19s19,8.523,19,19
	S32.459,40,21.983,40z"/>
          </svg>

          <div className="query">

            <input type="text" name="q" placeholder={s} value={s !== v ? v : ''} onChange={this.handleChange} ref={input=>this.input = input}/>

              {/*<!-- microphone icon -->*/}
            <svg className="active" title="Произнесите запрос вслух" onClick={this.handleSpeak} viewBox="0 0 58 58">
              <g>
                <path d="M44,28c-0.552,0-1,0.447-1,1v6c0,7.72-6.28,14-14,14s-14-6.28-14-14v-6c0-0.553-0.448-1-1-1s-1,0.447-1,1v6
		c0,8.485,6.644,15.429,15,15.949V56h-5c-0.552,0-1,0.447-1,1s0.448,1,1,1h12c0.552,0,1-0.447,1-1s-0.448-1-1-1h-5v-5.051
		c8.356-0.52,15-7.465,15-15.949v-6C45,28.447,44.552,28,44,28z"/>
                <path d="M29,46c6.065,0,11-4.935,11-11V11c0-6.065-4.935-11-11-11S18,4.935,18,11v24C18,41.065,22.935,46,29,46z M20,11
		c0-4.963,4.038-9,9-9s9,4.037,9,9v24c0,4.963-4.038,9-9,9s-9-4.037-9-9V11z"/>
              </g>

            </svg>

          </div>


        </form>   );

  }
}

render(
  <App/>,
  document.getElementById('search_app'));