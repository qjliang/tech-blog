# qBlog
基于nuxtjs，typescript Node.js 的开源个人博客系统，现代化的 UI 和用户体验。采用响应式布局，支持移动端访问。  

## 技术构成
* 开发语言 [TypeScript](https://www.typescriptlang.org/)
* 服务端 [Node.js](https://nodejs.org/)
* SSR框架 [NuxtJS](https://nuxtjs.org/)
* 前端框架 [Vue](https://vuejs.org/)
* 组件库 [Ant Design of Vue](https://www.antdv.com/docs/vue/introduce-cn/)
* Web字体 [Font Awesome](https://fontawesome.com/)
* 持久化 [MongoDB](https://www.mongodb.org/) 推荐
* 身份验证 [@nuxtjs/auth](https://auth.nuxtjs.org/)

## 快速开始

1. 准备条件

安装 [Node.js](https://nodejs.org/en/download/) (v8 以上版本)
推荐安装 [Yarn](https://yarnpkg.com/) 而非 npm 以进行包管理。

2. 安装依赖
```Shell
$ yarn
```

3. 启动站点

* 开发模式

```Shell
$ yarn run dev
```

* 生产模式

先编译项目
```shell
$ yarn run build
```

再启动站点
```shell
$ yarn start
```

打开浏览器，访问 [http://localhost:9000/](http://localhost:9000)
#### Enjoy it! :smile:

这里的前后端是分开的，需要单一个node,或其他服务来提供数据

## 许可协议
MIT License
