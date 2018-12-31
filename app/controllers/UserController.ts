
import { Controller, Router } from '../../'
import { User } from "../entity/User";

@Controller("/user")
class TestController {

  @Router.get('/')
  async index(ctx) {
    const users = await User.find()

    ctx.body = users
  }

  @Router.post('/')
  async create(ctx) {
    const user = new User()
    const { firstName, lastName, age } = ctx.request.fields

    user.firstName = firstName
    user.lastName = lastName
    user.age = age
    await user.save()

    ctx.body = user
  }

  @Router.put('/:id')
  async edit(ctx) {
    const { id } = ctx.params
    const { firstName, lastName } = ctx.request.fields
    const user = await User.findOne(id)
    user.lastName = lastName
    await user.save()

    ctx.body = user
  }
}