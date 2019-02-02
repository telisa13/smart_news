
module.exports = (body)=>{
  const read = Number.parseInt(body.length / 200);
  return read >= 10 ? 9 : (read< 1 ? 1 : read);
};