
module.exports = (str, rep="")=>{
  return str.replace(/<\/?[^>]+(>|$)/g, rep);
};