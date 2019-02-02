const dataReducer = (state, action)=>{

  switch (action.type){
    case 'LOAD_DATA':
      state ={
        ...state,
        link: action.payload.link,
        news: action.payload.news
      };
      break;


    case 'APPEND_DATA':
      const news = state.news.concat(action.payload.news);
      state = {
        ...state,
        page: action.payload.page,
        news
      };
      break;

  }
  return state;
};
export default dataReducer;