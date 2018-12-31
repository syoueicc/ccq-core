import * as Koa from 'koa'
import * as KoaRouter from 'koa-router'
import * as convert from 'koa-convert'
import * as glob from 'glob'
import { resolve, parse } from 'path'
import { createConnection } from "typeorm";

// 中间件接口
interface middlewars {
  [key: string]: any
}

// 路由健
const routerPrefix = Symbol('routerPrefix')

// 路由集合
const routeMap = []

// 中间件存储
export const Middleware: middlewars = {}

/**
 * CCQ类
 */
export default class Ccq extends Koa {

  router: KoaRouter

  constructor() {
    super()
    this.router = new KoaRouter()
    this._init()
  }

  _init() {
    const {database} = require(resolve(process.cwd(), './app/config')).default
    createConnection(database) //建立数据库链接
    this.registerGlobalMiddlewares() //注册全局中间件
    this.registerMiddlewares() // 注册中间件装饰器
    this.registerRouters() // 注册路由
  }

  /**
   * 遍历添加controller、路由
   */
  registerRouters() {
    const controllerPath = resolve(process.cwd(), 'app/controllers/**/*')
    glob.sync(controllerPath).forEach(require)
    for (let { target, method, path, cb } of (<any>Object).values(routeMap)) {
      this.router[method](parseControllerPath(target[routerPrefix]) + normalizePath(path), ...cb)
    }
    this.use(this.router.routes())
    this.use(this.router.allowedMethods())
  }

  /**
   * 注册中间件注解
   */
  registerMiddlewares() {
    const middlewarePath = resolve(process.cwd(), 'app/middlewares/**/*')
    glob.sync(middlewarePath).forEach(middleware => {
      const fn = require(middleware).default
      const name = parse(middleware).name
      Middleware[name] = params => (target, key) => {
        if (!Array.isArray(target[key])) target[key] = [target[key]]
        target[key].splice(target[key].length - 1, 0, (ctx, next) => { fn(params)(ctx, next) })
      }
    })
  }

  /**
   * 注册全局中间件
   */
  registerGlobalMiddlewares() {
    const config = require(resolve(process.cwd(), 'app/config')).default
    config.middlewares.forEach(middleware => this.use(convert(middleware[0](middleware[1]))))
  }
}

// 转化数组
const toArr = tar => (tar instanceof Array) ? tar : [tar]

// 格式化路由路径
const normalizePath = path => path.startsWith('/') ? path : `/${path}`

// 格式化跟路径
const parseControllerPath = path => path === '/' ? '' : normalizePath(path)

// 构造请求方式
const methodFactor = (path, options) => (target, key, descriptor) => {
  routeMap.push({
    target,
    method: options.method,
    path: path,
    cb: toArr(target[key])
  });
}

// 支持的请求方法集合
export const Router = Object.assign(
  {},
  ...([
    'get',
    'put',
    'post',
    'patch',
    'delete',
    'del',
    'all',
  ].map(method => ({ [method]: (path, options) => methodFactor(path, { ...options, method: method }) }))))


// 控制器注解
export const Controller = path => target => void (target.prototype[routerPrefix] = path)
