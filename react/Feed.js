import React from 'react';
import {render} from 'react-dom';
import moment from 'moment';
import elString from '../functions/ellipsisString';
import Switch from './Switch';


const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const START_DATE_ROW_TO_SHOW = 6;
const ADD_DATE_ROW_TO_SHOW = 6;

class DateRow extends React.Component{
  constructor(props){
    super(props);
    const {row} = this.props;
    const dt = new Date(row[0].datetime);
    moment.locale('ru');
    this.momentDt = moment(dt);

    const count = row.length > START_DATE_ROW_TO_SHOW ? START_DATE_ROW_TO_SHOW : row.length;
    this.state = {
      count,
    }
  }

  onShowMore(){
    const {row} = this.props;

    this.setState(prevState => {
      let newCount = prevState.count + ADD_DATE_ROW_TO_SHOW;
      if(newCount > row.length){
        newCount = row.length;
      }
      return {count: newCount};
    });
  }

  render(){
    const {row, renderItem} = this.props;
    const {count} = this.state;
    const render = [];

    for(let i = 0; i < count; i++){
      render.push(renderItem(row[i]))
    }
    return(
      <div className="news_date">
        <h3>{this.momentDt.format('ll')}</h3>
        <div className="news_date_content">
          {render}
        </div>
        {count < row.length&&
        <div className="showMoreNews_container">
          <div className="showMoreNews" onClick={() => this.onShowMore()}>Показать больше</div>
        </div>}
      </div>);
  }
}


class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      news: [],
      type: 'weight',
      // type: 'date',
      isLoading: true,
      page: 0,
      switchValue: true,
      shared: [],
    };
  }
  componentDidMount(){
    this.getNews();
    this.getFriendsNews();
  }

  getFriendsNews(){
    fetch(`/feed/shared`,{
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
      // body: JSON.stringify({type: this.state.type, page: this.state.page})
    })
    .then(res => res.json())
    .then(response => {
      console.log(response);
      if(response.status){
        this.setState({shared: response.data})
      }
    })
    .catch(err => {
      console.log(err);
    });
  }

  getNews(){
    fetch(`/feed`,{
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
      body: JSON.stringify({type: this.state.type, page: this.state.page})
    })
    .then(res => res.json())
    .then(response => {
      this.setState(prevState => {
        return {news: [...prevState.news, ...response.data], isLoading: false}
      });
      console.log(response);
    })
    .catch(err => {
      console.log(err);
    });
  }

  onSwitch(value){
    const newType = value ? 'weight' : 'date';
    this.setState({type: newType, isLoading: true, page: 0, news:[]}, () => {
      this.getNews();
    })
  }

  renderItem(data){

    const image= {
      backgroundImage: `url(${data.image})`
    };

    const backgroundColor = `rgba(255,255,255,${data.weight})`;

    const dt = new Date(data.datetime);
    moment.locale('ru');
    const momentDt = moment(dt);

    const strRead = data.read === 1? 'у' : (data.read < 5 ? 'ы' : '');
    return(
      <a href={`/news/${data.id}`} className="news_app_item clearA" style={{backgroundColor}} key={data.id}>
        <div className="item_image" style={image}>
          <img src={data.source.icon} className="icon"/>
          <div className="info">
            <time dateTime={dt}>{momentDt.fromNow()}</time>
            <div className="item_views">
              <span>{data.views}</span>

              <img src="/images/view.svg"/>
            </div>
          </div>
        </div>
        <h3 className="item_title"> {elString(data.title)} </h3>

        {/*<p className="description">*/}
          {/*{elString(data.description, 70)}*/}
        {/*</p>*/}
        <div className="read">
          {`читать ${data.read} минут${strRead}`}
        </div>
      </a>)
  }

  onLoadMore(){
    this.setState(prevState=>{
      return{ page: prevState.page+1, isLoading: true}
    }, () =>{
      this.getNews()
    });
  }

  render(){
    const { news, type, isLoading, switchValue, shared } = this.state;

    return (
      <div className="news_app_container">

            <div className="shared">

              <h3>Ваши друзья рекомендуют</h3>


              <div className="shared_content">
                {shared.map(n =>
                  <a href={`/news/${n.id}`} target="_blank" className="shared_item clearA">
                    <div className="item_image" style={{backgroundImage: `url(${n.image})`}}>
                      <div className="friends">
                        {n.friends.map( f => <div className="friend" style={{backgroundColor: f.color}} title={f.name}>{f.name.substr(0, 1)}</div>)}
                      </div>
                    </div>
                    <div className="info">
                      {elString(n.title, 50)}
                    </div>
                  </a>)}
              </div>
            </div>

            <div className="select_format">
              <h3>Формат подачи новостей</h3>
              <Switch value={switchValue} text1="Предпочтения" text2="Хронология" onChange={(v)=>this.onSwitch(v)}/>

            </div>

            <div className="news_content">


              {type === 'weight' &&
                <div className="news_app_grid">
                  {news.map( n => this.renderItem(n) )}
                </div>
              }

              {type === 'date' &&
              <div className="news_app_grid_date">
                {news.map( (d, i) => <DateRow row={d} key={i} renderItem={(n)=>this.renderItem(n)}/> )}
              </div>
              }

              {!isLoading&&<div onClick={() => this.onLoadMore()} className="news_app_button"> Загрузить ещё </div>}
            </div>

        {isLoading&& <div className="isLoading"/>}


      </div>);
  }
}

render(
  <App/>,
  document.getElementById('feed_app'));