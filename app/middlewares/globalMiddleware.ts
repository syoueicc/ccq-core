export default options => async (ctx, next) => {
  console.log(JSON.stringify(options))
  await next()
}