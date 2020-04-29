<template>
  <div>
    <category-list :categories="categories" />
    <post-list :category="category" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IResp } from '@/types';
import { ISetting } from '@/types/schema';
import PostList from '~/components/PostList.vue';
import CategoryList from '~/components/CategoryList.vue';
export const allCategoryItem = {
  _id: '',
  cateName: '全部分类',
  alias: '',
  img:
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyBzdHlsZT0id2lkdGg6MzA4cHg7aGVpZ2h0OjMwOHB4OyIgdmVyc2lvbj0iMS4xIiBpZD0i5Zu+5b2iIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEwMjRweCIgaGVpZ2h0PSIxMDI0cHgiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEwMjQgMTAyNCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiAgPHBhdGggY2xhc3M9InN2Z3BhdGgiIGRhdGEtaW5kZXg9InBhdGhfMCIgZmlsbD0iI2VhODAxMCIgZD0iTTMwMS45MTk4NDIgMTE1LjMxNzM5OSAxMjIuMjg1NjAyIDExNS4zMTczOTlsMCAxNzkuNjM0MjRjMCAwIDAgMTc5LjYzNDI0IDE3OS42MzQyNCAxNzkuNjM0MjRsMTc5LjYzNDI0IDBMNDgxLjU1NDA4MiAyOTQuOTUxNjM5QzQ4MS41NTQwODIgMTE1LjMxNzM5OSAzMDEuOTE5ODQyIDExNS4zMTczOTkgMzAxLjkxOTg0MiAxMTUuMzE3Mzk5TDMwMS45MTk4NDIgMTE1LjMxNzM5OXpNNDIxLjY3NDI5NyA0MTQuNzA2MDkzIiAvPgo8cGF0aCBjbGFzcz0ic3ZncGF0aCIgZGF0YS1pbmRleD0icGF0aF8xIiBmaWxsPSIjZWE4MDEwIiBkPSJNNzIxLjA2ODEwOCAxMTUuMzE3Mzk5YzAgMC0xNzkuNjM0MjQgMC0xNzkuNjM0MjQgMTc5LjYzNDI0bDAgMTc5LjYzNDI0IDE3OS42MzQyNCAwYzE3OS42MzQyNCAwIDE3OS42MzQyNC0xNzkuNjM0MjQgMTc5LjYzNDI0LTE3OS42MzQyNEw5MDAuNzAyMzQ4IDExNS4zMTczOTkgNzIxLjA2ODEwOCAxMTUuMzE3Mzk5IDcyMS4wNjgxMDggMTE1LjMxNzM5OXpNODQwLjgyMjU2MiAyOTQuOTUxNjM5IiAvPgo8cGF0aCBjbGFzcz0ic3ZncGF0aCIgZGF0YS1pbmRleD0icGF0aF8yIiBmaWxsPSIjZWE4MDEwIiBkPSJNNzIxLjA2ODEwOCA1MzQuNDY0NjQxIDU0MS40MzM4NjggNTM0LjQ2NDY0MWwwIDE3OS42MzQyNGMwIDE3OS42MzQyNCAxNzkuNjM0MjQgMTc5LjYzNDI0IDE3OS42MzQyNCAxNzkuNjM0MjRsMTc5LjYzNDI0IDBMOTAwLjcwMjM0OCA3MTQuMDk4ODgxQzkwMC43MDEzMjUgNzE0LjA5ODg4MSA5MDAuNzAxMzI1IDUzNC40NjQ2NDEgNzIxLjA2ODEwOCA1MzQuNDY0NjQxTDcyMS4wNjgxMDggNTM0LjQ2NDY0MXoiIC8+CjxwYXRoIGNsYXNzPSJzdmdwYXRoIiBkYXRhLWluZGV4PSJwYXRoXzMiIGZpbGw9IiNlYTgwMTAiIGQ9Ik0xMjIuMjg1NjAyIDcxNC4wOTg4ODFsMCAxNzkuNjM0MjRMMzAxLjkxOTg0MiA4OTMuNzMzMTIxYzAgMCAxNzkuNjM0MjQgMCAxNzkuNjM0MjQtMTc5LjYzNDI0TDQ4MS41NTQwODIgNTM0LjQ2NDY0MSAzMDEuOTE5ODQyIDUzNC40NjQ2NDFDMTIyLjI4NTYwMiA1MzQuNDY0NjQxIDEyMi4yODU2MDIgNzE0LjA5ODg4MSAxMjIuMjg1NjAyIDcxNC4wOTg4ODFMMTIyLjI4NTYwMiA3MTQuMDk4ODgxek00MjEuNjc0Mjk3IDcxNC4wOTg4ODEiIC8+Cgo8L3N2Zz4K',
  sequence: -1
};

export default Vue.extend({
  components: {
    CategoryList,
    PostList
  },

  async asyncData ({ $axios, params, error }: any) {
    const { code, data }: IResp = await $axios.$get('/api/categories');
    if (code === 1) {
      data.unshift(allCategoryItem);
      const alias = params.category || '';
      const category = data.find(item => item.alias === alias);
      if (category) {
        return {
          categories: data,
          category
        };
      }
      error({
        statusCode: 404,
        message: '未找到该页面'
      });
    } else {
      error({
        statusCode: 500,
        message: '内部服务器错误'
      });
    }
  },

  data () {
    return {
      categories: [],
      category: null
    };
  },
  head (this: any) {
    const settings = this.$store.state.settings as ISetting;
    const suffix = ` - ${settings.blogName}`;
    return {
      title: this.category.cateName + suffix,
      meta: [
        { hid: 'description', name: 'description', content: settings.blogIntro || settings.blogName },
        { name: 'keywords', content: settings.blogName }
      ]
    };
  }
});
</script>
