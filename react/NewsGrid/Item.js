import React from 'react';
import moment from 'moment';
import elString from '../../functions/ellipsisString';

export default class Item extends React.Component{
  constructor(){
    super();
  }

  render(){
    const data = this.props.data;
    const image= {
      backgroundImage: `url(${data.image})`
    };

    const dt = new Date(data.datetime);
    moment.locale('ru');
    const momentDt = moment(dt);

    const strRead = data.read === 1? 'у' : (data.read < 5 ? 'ы' : '');
    return (
      <a href={`/news/${data.id}`} className="news_app_item clearA">
        <div className="item_image" style={image}>
          <img src={data.source.icon} className="icon"/>
        </div>
        <h3 className="item_title"> {elString(data.title)} </h3>
        <div className="info">
          <time dateTime={dt}>{momentDt.fromNow()}</time>
          <div className="item_views">
            <span>{data.views}</span>

            <img src="/images/view.svg"/>
          </div>
        </div>
        <p className="description">
          {elString(data.description, 70)}
        </p>
        <div className="read">
          {`читать ${data.read} минут${strRead}`}
        </div>
        <footer className="item_bottom">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </footer>
      </a>);
  }
}
