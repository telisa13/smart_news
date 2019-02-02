import React from 'react';
import {connect} from 'react-redux';
import {loadData, appendData} from './actions';
import Item from './Item';

class App extends React.Component{
  constructor(){
    super();
    this.onClickHandler = this.onClickHandler.bind(this);
  }
  componentDidMount(){
    // загрузка новостей при открытии страницы
    this.props.setNews(this.props.url);
  }
  onClickHandler(){
    // дополнительная загрузка новостей
    this.props.loadMoreNews(this.props.link, this.props.page+1);
  }
  render(){
    const toRender = this.props.news.length > 0 ?
      (<div className="news_app_container">
        <div className="news_app_grid">
          {this.props.news.map(n => <Item key={n.id} data={n}/>)}
        </div>
        <div onClick={this.onClickHandler} className="news_app_button"> Загрузить ещё </div>
      </div>)
       : <div className="loading"><div></div><div></div><div></div></div>;
    return (
      <div>
          {toRender}
      </div>);
  }
}

// state - redux global state
const mapStateToProps = (state)=>{
  return {
    ...state
  };
};

// state - redux global state
const mapDispatchToProps = (dispatch)=>{
  return {
    setNews: (data)=>{
      dispatch(loadData(data));
    },
    loadMoreNews: (link, page)=>{
      dispatch(appendData(link, page));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps )(App);
