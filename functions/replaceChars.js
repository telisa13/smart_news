
module.exports = (str)=>{
  const arr = [
    [/&#8221;/g, '"'],
    [/&#8220;/g, '"'],
    [/&quot;/g, '"'],
    [/&#8211;/g, '-'],
  ];
  arr.forEach(i=> str = str.replace(i[0], i[1]));
  return str;
};