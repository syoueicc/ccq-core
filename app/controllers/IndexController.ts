import { Controller, Router, Middleware } from '../../'

@Controller("/")
class IndexController {

  @Router.get('/')
  @Middleware.middleware('middleware')
  async index(ctx, next) {
    ctx.body = 'hello world'
  }
}
