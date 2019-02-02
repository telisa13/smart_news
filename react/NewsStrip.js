import React from 'react';
import {render} from 'react-dom';

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {news:[], timer: null};
  }
  componentDidMount(){

    fetch('/strip').then(res=> res.json()).then(res => {
      this.setState({news: res.data});
    })
    .catch(err => {
      console.log(err);
    });
  }
  componentDidUpdate(){

    // slider
    const slider = document.querySelector('div.news_slider');

    let startValue = window.innerWidth;

    // check if we need to scroll (at 400px there is no NewsStrip)
    if(startValue <= 400){
      return;
    }

    //new margin-left value
    let newValue = startValue;
    const speed = 2;

    // change margin-left in loop
    const id = setInterval(()=>{
      newValue-=speed;
      if(Math.abs(newValue) >= slider.clientWidth){
        newValue = startValue;
      }
      slider.style['margin-left'] = `${newValue}px`;
    }, 30);
  }


  render(){
    const toRender = this.state.news.length > 0 ?
      this.state.news.map(n =>
        <a href={`/news/${n.id}`} className="item clearA">{n.title}</a>
      ) : 'No news';

    return (
      <div className="news_container">
        <div className="news_slider">
          {toRender}
        </div>
      </div>);
  }
}

render( <App/>,  document.getElementById('news_strip'));