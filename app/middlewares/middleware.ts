export default options => async (ctx, next) => {
  console.log('test middleware...', options);
  await next()
}