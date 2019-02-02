
module.exports = (str, count=60)=>{
  if(str.length > count){
    str = str.substr(0, count) + '...';
  }
  return str;
};