
module.exports = (id_category, min=0, max=4)=>{

  return `/images/news/${id_category}/${randomInteger(min, max)}.jpg`;
};

function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  rand = Math.floor(rand);
  return rand;
}