/* eslint-disable */
import { Configuration } from "@nuxt/types/index";

const config: Configuration = {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    title: "qBlog",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || "",
      },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#f80" },
  /*
   ** Global CSS
   */
  css: [
    "ant-design-vue/dist/antd.less",
    "@fortawesome/fontawesome-svg-core/styles.css",
    "~/static/main.css",
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: "@/plugins/axios", mode: "client" },
    "@/plugins/ant-design",
    "@/plugins/font-awesome",
    "@/plugins/web-font/index",
    "@/plugins/event-bus",
    { src: "@/plugins/baidu-stats", mode: "client" },
    { src: "@/plugins/tui-editor", mode: "client" },
  ],
  buildModules: ["@nuxt/typescript-build"],
  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxtjs/axios", "@nuxtjs/auth", "@nuxtjs/pwa"],
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: {
            url: "/api/auth/login",
            method: "post",
            propertyName: "token.accessToken",
          },
          logout: { url: "/api/auth/logout", method: "post" },
          user: { url: "/api/auth/user", method: "get", propertyName: "user" },
        },
      },
    },
    redirect: {
      login: "/auth/login",
      logout: "/",
      callback: "/auth/login",
      home: "/",
    },
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    // proxy: true,
    baseURL: "http://121.37.159.49:3001",
    browserBaseURL: "",
    // credentials: true
  },
  // proxy: {
  //   '/api': 'http://localhost:3001'
  // },
  /*
   ** Build configuration
   */
  generate: {},
  build: {
    /*
     ** You can extend webpack config here
     */
    extend() {},
    loaders: {
      less: {
        modifyVars: {
          // 'font-size-base': '16px',
          "outline-width": "0",
        },
        javascriptEnabled: true,
      },
    },
  },
  typescript: {
    typeCheck: {
      eslint: true,
    },
  },
  // watch: ['~/server']
};

export default config;
