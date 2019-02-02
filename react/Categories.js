import React from 'react';
import {render} from 'react-dom';
import moment from 'moment';
import elString from '../functions/ellipsisString';
import Switch from './Switch';


const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const START_DATE_ROW_TO_SHOW = 6;
const ADD_DATE_ROW_TO_SHOW = 6;

class CategoryRow extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      showButton: true,
      page: 0,
    };

  }

  onShowMore(){
    const {row, addNews} = this.props;
    const {page} = this.state;

    fetch(`/categories/more?category=${row.id}&page=${page+1}`,{
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
    })
    .then(res => res.json())
    .then(response => {
      console.log(response);
      if(response.status) {
        // this.setState({categories: response.data, isLoading: false});
        addNews(response.data);
        this.setState(prevState =>{
          return {page: prevState.page + 1, showButton: !response.data.end}
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
  }

  render(){
    const {row, renderItem, index} = this.props;
    const {showButton} = this.state;
    const render = [];

    for(let i = 0; i < row.news.length; i++){
      render.push(renderItem(row.news[i]))
    }
    return(
    <details className="news_date" open={index === 0}>
      <summary>
        <span>{row.name}</span>
      </summary>
      <div>
        <div className="news_date_content">
          {render}
        </div>
        {showButton&&
        <div className="showMoreNews_container">
          <div className="showMoreNews" onClick={() => this.onShowMore()}>Показать больше</div>
        </div>}
      </div>
    </details>
      // <div className="news_date">
      //   <h3>{row.name}</h3>
      //   <div className="news_date_content">
      //     {render}
      //   </div>
      //   {showButton&&
      //   <div className="showMoreNews_container">
      //     <div className="showMoreNews" onClick={() => this.onShowMore()}>Показать больше</div>
      //   </div>}
      // </div>
  );
  }
}


class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      categories: [],
      isLoading: true,
      page: 0,
    };
  }
  componentDidMount(){
    this.getNews();
  }

  getNews(){
    fetch(`/categories`,{
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
      // body: JSON.stringify({type: this.state.type, page: this.state.page})
    })
    .then(res => res.json())
    .then(response => {
      console.log(response);
      if(response.status)
        this.setState({categories: response.data, isLoading: false});
    })
    .catch(err => {
      console.log(err);
    });
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

  addNews(data){

    this.setState(prevState => {
      let categories = prevState.categories;
      let catIndex = 0;
      categories.forEach((c, i) =>{
        if(c.id === parseInt(data.id)){
          catIndex = i;
        }
      });
      categories[catIndex].news = [...categories[catIndex].news, ...data.news];
      return {categories};
    });
  }

  render(){
    const { categories, isLoading } = this.state;

    return (
      <div className="news_app_container">

            <div className="select_format">
              {/*<h3></h3>*/}
            </div>

            <div className="news_content">



              <div className="news_app_grid_date">
                {categories.map( (d, i) => <CategoryRow row={d} key={i} index={i}
                                                        addNews={(n) => this.addNews(n)}
                                                        renderItem={(n)=>this.renderItem(n)}/> )}
              </div>
            </div>

        {isLoading&& <div className="isLoading"/>}


      </div>);
  }
}

render(
  <App/>,
  document.getElementById('categories_app'));