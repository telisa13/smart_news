import React from 'react';
import {render} from 'react-dom';

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");


class Item extends React.Component{

  render(){
    const {f, i, selected, select, isMy} = this.props;
    const style = {animationDelay: .2 * i+'s'};
    let isSelected = false;
    if(selected && selected.id === f.id){
      style.backgroundColor = f.color;
      isSelected = true;
    }
    return(
      <li key={i} className={`item ${isSelected && 'selected'}`}
          onClick={()=>select(f)}
          style={style}>
        <div className="avatar" style={{backgroundColor: f.color}}>
          {f.name.substr(0,1)}
          {!isMy&&<div className="similarity">{(f.similarity * 100).toFixed(0)}%</div>}
        </div>
        <span className="username">{f.name}</span>
      </li>
    );
  }
}

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      friends:[
        // {name: 'Джо Тривиани', color: 'rgba(58,217,38,1)', similarity: 0.9},
        // {name: 'Петя', color: 'rgba(29,165,149,1)', similarity: 0.85},
        // {name: 'Васыль', color: 'rgba(162,134,72,1)', similarity: 0.5},
        // {name: 'Андрей Антонович мироненко', color: '#ff00e6', similarity: 0.8},
        // {name: 'sunny_678', color: 'rgba(155,242,1,1)', similarity: 0.5},
        // {name: 'Best user', color: 'rgba(7,185,234,1)', similarity: 0.5},
        // {name: 'Best user', color: 'rgba(7,185,234,1)', similarity: 0.5},
        // {name: 'Best user', color: 'rgba(7,185,234,1)', similarity: 0.5},
        // {name: 'Best user', color: 'rgba(7,185,234,1)', similarity: 0.5},
        // {name: 'Best user', color: 'rgba(7,185,234,1)', similarity: 0.1},
      ],
      type: 'recommended',
      selected: null,
    };
  }

  componentDidMount(){
    this.getRecommended();
  }

  getRecommended(){
    fetch('/user/friends',{
      method: 'POST',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(res => {
        if(res.data.length > 0)
          this.setState({friends: res.data, selected: res.data[0]});
        // console.log(res);
      });
  }

  getMy(){
    this.setState({friends: [], selected: null});

    fetch('/user/friends/my',{
      method: 'POST',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      if(res.status && res.data.length > 0)
        this.setState({friends: res.data, selected: res.data[0]});
    });
  }

  onSelect(friend){
    this.setState({selected: friend})
  }

  handleChange(type){
    if(type === this.state.type)
      return;

    this.setState({type}, () => {
      if(this.state.type === 'my')
        this.getMy();
      else
        this.getRecommended();
    })
  }

  addFriend(id){
    console.log('send ', id);
    const name = this.state.selected.name;
    fetch('/user/friends/accept',{
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
      body: JSON.stringify({friend: id})
    })
    .then(res => res.json())
    .then(res => {
      if(res.status){
        alert(`Пользователь ${name} стал вашим другом!`);

        this.getRecommended();
      }
      console.log(res);
    });
  }

  render(){
    const {type, friends, selected} = this.state;
    const isMy = type === 'my';
    return (
      <div className="app_container">
        <header className={`row ${isMy ? 'my': ''}`}>
          <div onClick={()=> this.handleChange('recommended')} className={`header_button ${type === 'recommended' ? 'selected': ''}`}>Рекомендованные</div>
          <div onClick={()=> this.handleChange('my')} className={`header_button ${type === 'my' ? 'selected': ''}`}>Мои друзья</div>

        </header>
        <div className="content">
          <ul className="list">
            {friends.map((f, i) => <Item key={i} i={i} f={f} isMy={isMy} selected={selected} select={(f)=>this.onSelect(f)}/>)}
          </ul>
          <div className="friend_info">
            {selected&&
            <header className="row">
              <span>
                {selected.name}
                {!isMy&&<span className="similarity">{(selected.similarity*100).toFixed(2)}%</span>}
              </span>
              {!isMy&&<div className="like" title="Добавить в друзья" onClick={()=> this.addFriend(selected.id)}>Респект</div>}
              {isMy&&<div className="like connect" title="Отправить пригласительное письмо" onClick={()=> this.addFriend(selected.id)}>
                <svg className="email" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px"
                      viewBox="0 0 512 512"  >
                  <rect x="64" y="64" width="384" height="384"/>
                  <polygon  points="256,296.384 448,448 448,148.672 "/>
                  <path  d="M464,64h-16L256,215.616L64,64H48C21.504,64,0,85.504,0,112v288c0,26.496,21.504,48,48,48h16V148.672
                    l192,147.68L448,148.64V448h16c26.496,0,48-21.504,48-48V112C512,85.504,490.496,64,464,64z"/>
                </svg>
                <span className="connect">Связаться</span>
              </div>}
            </header>}


            {selected&&
            <div className="friend_history">
              {selected.history.map( n =>
                <div className=" row history_item"
                   style={{
                     flexDirection: n.interesting ? 'row-reverse' : 'row'
                   }} >

                  <a href={`/news/${n.id}`} className="clearA row" target="_blank">
                    <div className="image" style={{backgroundImage: `url(${n.image})`}}/>
                  </a>
                  <div className="info">
                    <div className="underlay" style={{backgroundColor: n.interesting ? selected.color : '#ececec'}}/>
                    <a href={`/news/${n.id}`} className="clearA row" target="_blank"><span className="title">{n.title}</span></a>
                    <p>{n.description}</p>

                    {n.interesting&&<div className="news_stat">
                      <img src="/images/exclamation-mark.png"/>
                      <span className="interest">{selected.name} это интересно</span>
                    </div>}
                  </div>

                  </div>)}

            </div>}

          </div>

        </div>
      </div>);
  }
}

render(<App/>,
  document.getElementById('friends_app'));
