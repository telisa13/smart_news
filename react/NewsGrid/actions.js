export function loadData(url) {
  return dispatch=>{

    fetch(`${url}`)
    .then(res => res.json())
    .then(response => {
      if(response.status) {


        dispatch({
          type: 'LOAD_DATA',
          payload:{
            news: response.data,
            link: url
          }
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
  };

}


export function appendData(link, page) {
  return dispatch=>{
    fetch(`${link}?page=${page}`)
      .then(res => res.json())
      .then(response => {
        if(response.status) {
          dispatch({
            type: 'APPEND_DATA',
            payload:{
              news: response.data,
              page
            }
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };
}

