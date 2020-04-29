<template>
  <div>
    <div class="page-header">
      分类管理
    </div>
    <div class="page-body">
      <div class="btn-wrap">
        <a-button type="error" :disabled="delDisabled" @click="delAll">
          <span>删除</span>
          <a-badge :count="selectedRowKeys.length" class="badge-count" />
          <span v-show="selectedRowKeys.length">项</span>
        </a-button>
        <a-button type="dashed" @click="addNew">
          <font-awesome-icon
            :icon="['fas', 'plus']"
            style="margin-right: 4px;"
          />新的分类
        </a-button>
      </div>
      <a-table
        :data-source="categories"
        :columns="tableColumns"
        :loading="isLoading"
        :pagination="false"
        row-key="_id"
        :scroll="{ x: 985 }"
        :row-selection="rowSelection"
      >
        <template slot="img" slot-scope="text, row">
          <img class="tb-img" :src="row.img">
        </template>
        <template slot="createTime" slot-scope="text, row">
          {{ row.createTime | toDate }}
        </template>
        <template slot="modifyTime" slot-scope="text, row">
          {{ row.modifyTime | toDate }}
        </template>
        <template slot="action" slot-scope="text, row">
          <div class="action-td">
            <a-button
              title="编辑"
              :disabled="!row._id"
              @click="editCategory(row)"
            >
              <font-awesome-icon
                :icon="['fas', 'pencil-alt']"
              />
            </a-button>
            <a-button
              title="删除"
              :disabled="['', otherCategoryId].indexOf(row._id) >= 0"
              @click="del(row._id)"
            >
              <font-awesome-icon
                :icon="['far', 'trash-alt']"
              />
            </a-button>
          </div>
        </template>
      </a-table>
      <a-modal
        v-model="isModalShow"
        :title="modalTitle"
        :confirm-loading="confirmLoading"
        :closable="false"
        :destroy-on-close="true"
        @ok="saveCategory"
      >
        <a-form label-position="top" :form="form">
          <a-form-item label="分类图标" :colon="false">
            <div class="img-tip">
              <a-icon type="info-circle" />
              <span>
                你可以在
                <a
                  href="https://www.iconfont.cn/"
                  target="_blank"
                >阿里巴巴矢量图标库</a>
                搜索和下载喜欢的图标。
              </span>
            </div>
            <a-upload
              v-decorator="['upload', imgOpts]"
              name="imgUpload"
              :show-upload-list="false"
              list-type="picture-card"
              :before-upload="beforeUpload"
              accept="image/*"
              @change="uploadChange"
            >
              <img v-if="imageUrl" :src="imageUrl" alt="image">
              <div v-else>
                <a-icon :type="imgLoading ? 'loading' : 'plus'" />
                <div class="ant-upload-text">
                  上传图片
                </div>
              </div>
            </a-upload>
          </a-form-item>
          <a-form-item label="分类名称" :colon="false">
            <a-input
              v-decorator="['cateName', cateNameOpts]"
              placeholder="请输入名称"
              allow-clear
            />
          </a-form-item>
          <a-form-item :colon="false">
            <span slot="label">
              Alias
              <a-tooltip title="分类别名，如：nodejs，将作为URL的一部分">
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <a-input
              v-decorator="['alias', aliasOpts]"
              placeholder="请输入Alias"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="排序" :colon="false">
            <a-input-number
              v-decorator="['sequence', sequenceOpts]"
              :min="0"
              :max="10000"
              :disabled="uid === otherCategoryId"
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { IResp } from '@/types';
/**
 * 全部分类
 */
export const allCategoryItem = {
  _id: '',
  cateName: '全部分类',
  alias: '',
  img:
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyBzdHlsZT0id2lkdGg6MzA4cHg7aGVpZ2h0OjMwOHB4OyIgdmVyc2lvbj0iMS4xIiBpZD0i5Zu+5b2iIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEwMjRweCIgaGVpZ2h0PSIxMDI0cHgiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEwMjQgMTAyNCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiAgPHBhdGggY2xhc3M9InN2Z3BhdGgiIGRhdGEtaW5kZXg9InBhdGhfMCIgZmlsbD0iI2VhODAxMCIgZD0iTTMwMS45MTk4NDIgMTE1LjMxNzM5OSAxMjIuMjg1NjAyIDExNS4zMTczOTlsMCAxNzkuNjM0MjRjMCAwIDAgMTc5LjYzNDI0IDE3OS42MzQyNCAxNzkuNjM0MjRsMTc5LjYzNDI0IDBMNDgxLjU1NDA4MiAyOTQuOTUxNjM5QzQ4MS41NTQwODIgMTE1LjMxNzM5OSAzMDEuOTE5ODQyIDExNS4zMTczOTkgMzAxLjkxOTg0MiAxMTUuMzE3Mzk5TDMwMS45MTk4NDIgMTE1LjMxNzM5OXpNNDIxLjY3NDI5NyA0MTQuNzA2MDkzIiAvPgo8cGF0aCBjbGFzcz0ic3ZncGF0aCIgZGF0YS1pbmRleD0icGF0aF8xIiBmaWxsPSIjZWE4MDEwIiBkPSJNNzIxLjA2ODEwOCAxMTUuMzE3Mzk5YzAgMC0xNzkuNjM0MjQgMC0xNzkuNjM0MjQgMTc5LjYzNDI0bDAgMTc5LjYzNDI0IDE3OS42MzQyNCAwYzE3OS42MzQyNCAwIDE3OS42MzQyNC0xNzkuNjM0MjQgMTc5LjYzNDI0LTE3OS42MzQyNEw5MDAuNzAyMzQ4IDExNS4zMTczOTkgNzIxLjA2ODEwOCAxMTUuMzE3Mzk5IDcyMS4wNjgxMDggMTE1LjMxNzM5OXpNODQwLjgyMjU2MiAyOTQuOTUxNjM5IiAvPgo8cGF0aCBjbGFzcz0ic3ZncGF0aCIgZGF0YS1pbmRleD0icGF0aF8yIiBmaWxsPSIjZWE4MDEwIiBkPSJNNzIxLjA2ODEwOCA1MzQuNDY0NjQxIDU0MS40MzM4NjggNTM0LjQ2NDY0MWwwIDE3OS42MzQyNGMwIDE3OS42MzQyNCAxNzkuNjM0MjQgMTc5LjYzNDI0IDE3OS42MzQyNCAxNzkuNjM0MjRsMTc5LjYzNDI0IDBMOTAwLjcwMjM0OCA3MTQuMDk4ODgxQzkwMC43MDEzMjUgNzE0LjA5ODg4MSA5MDAuNzAxMzI1IDUzNC40NjQ2NDEgNzIxLjA2ODEwOCA1MzQuNDY0NjQxTDcyMS4wNjgxMDggNTM0LjQ2NDY0MXoiIC8+CjxwYXRoIGNsYXNzPSJzdmdwYXRoIiBkYXRhLWluZGV4PSJwYXRoXzMiIGZpbGw9IiNlYTgwMTAiIGQ9Ik0xMjIuMjg1NjAyIDcxNC4wOTg4ODFsMCAxNzkuNjM0MjRMMzAxLjkxOTg0MiA4OTMuNzMzMTIxYzAgMCAxNzkuNjM0MjQgMCAxNzkuNjM0MjQtMTc5LjYzNDI0TDQ4MS41NTQwODIgNTM0LjQ2NDY0MSAzMDEuOTE5ODQyIDUzNC40NjQ2NDFDMTIyLjI4NTYwMiA1MzQuNDY0NjQxIDEyMi4yODU2MDIgNzE0LjA5ODg4MSAxMjIuMjg1NjAyIDcxNC4wOTg4ODFMMTIyLjI4NTYwMiA3MTQuMDk4ODgxek00MjEuNjc0Mjk3IDcxNC4wOTg4ODEiIC8+Cgo8L3N2Zz4K',
  sequence: -1
};

/**
 * 未分类
 */
export const otherCategoryItem = {
  _id: '5dc52b0aba304f6314a9229f',
  cateName: '未分类',
  alias: 'others',
  img:
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyBzdHlsZT0id2lkdGg6MzA4cHg7aGVpZ2h0OjMwOHB4OyIgdmVyc2lvbj0iMS4xIiBpZD0i5Zu+5b2iIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEwMjRweCIgaGVpZ2h0PSIxMDI0cHgiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEwMjQgMTAyNCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiAgPHBhdGggY2xhc3M9InN2Z3BhdGgiIGRhdGEtaW5kZXg9InBhdGhfMCIgZmlsbD0iI2VhODAxMCIgZD0iTTMwMS45MTk4NDIgMTE1LjMxNzM5OSAxMjIuMjg1NjAyIDExNS4zMTczOTlsMCAxNzkuNjM0MjRjMCAwIDAgMTc5LjYzNDI0IDE3OS42MzQyNCAxNzkuNjM0MjRsMTc5LjYzNDI0IDBMNDgxLjU1NDA4MiAyOTQuOTUxNjM5QzQ4MS41NTQwODIgMTE1LjMxNzM5OSAzMDEuOTE5ODQyIDExNS4zMTczOTkgMzAxLjkxOTg0MiAxMTUuMzE3Mzk5TDMwMS45MTk4NDIgMTE1LjMxNzM5OXpNNDIxLjY3NDI5NyA0MTQuNzA2MDkzIDMwMS45MTk4NDIgNDE0LjcwNjA5M2MtMTA5LjM3ODEzIDAtMTE5LjMxOTU0OS05Mi4wMDk1NTQtMTE5Ljc1NDQ1NC0xMTkuNzU1NDc4TDE4Mi4xNjUzODggMTc1LjE5NjE2MSAzMDEuOTE5ODQyIDE3NS4xOTYxNjFjMTkuOTk4NDczIDAgMTE5Ljc1NDQ1NCA1Ljc4NzgyIDExOS43NTQ0NTQgMTE5Ljc1NDQ1NEw0MjEuNjc0Mjk3IDQxNC43MDYwOTMgNDIxLjY3NDI5NyA0MTQuNzA2MDkzek00MjEuNjc0Mjk3IDQxNC43MDYwOTMiIC8+CjxwYXRoIGNsYXNzPSJzdmdwYXRoIiBkYXRhLWluZGV4PSJwYXRoXzEiIGZpbGw9IiNlYTgwMTAiIGQ9Ik03MjEuMDY4MTA4IDExNS4zMTczOTljMCAwLTE3OS42MzQyNCAwLTE3OS42MzQyNCAxNzkuNjM0MjRsMCAxNzkuNjM0MjQgMTc5LjYzNDI0IDBjMTc5LjYzNDI0IDAgMTc5LjYzNDI0LTE3OS42MzQyNCAxNzkuNjM0MjQtMTc5LjYzNDI0TDkwMC43MDIzNDggMTE1LjMxNzM5OSA3MjEuMDY4MTA4IDExNS4zMTczOTkgNzIxLjA2ODEwOCAxMTUuMzE3Mzk5ek04NDAuODIyNTYyIDI5NC45NTE2MzljMCAxOS45OTg0NzMtNS43ODc4MiAxMTkuNzU1NDc4LTExOS43NTQ0NTQgMTE5Ljc1NTQ3OEw2MDEuMzA4NTM3IDQxNC43MDcxMTcgNjAxLjMwODUzNyAyOTQuOTUxNjM5YzAtMTA5LjM3NzEwNiA5Mi4wMDk1NTQtMTE5LjMxODUyNiAxMTkuNzU4NTQ4LTExOS43NTQ0NTRsMTE5Ljc1NDQ1NCAwTDg0MC44MjE1MzkgMjk0Ljk1MTYzOSA4NDAuODIyNTYyIDI5NC45NTE2Mzl6TTg0MC44MjI1NjIgMjk0Ljk1MTYzOSIgLz4KPHBhdGggY2xhc3M9InN2Z3BhdGgiIGRhdGEtaW5kZXg9InBhdGhfMiIgZmlsbD0iI2VhODAxMCIgZD0iTTcyMS4wNjgxMDggNTM0LjQ2NDY0MSA1NDEuNDMzODY4IDUzNC40NjQ2NDFsMCAxNzkuNjM0MjRjMCAxNzkuNjM0MjQgMTc5LjYzNDI0IDE3OS42MzQyNCAxNzkuNjM0MjQgMTc5LjYzNDI0bDE3OS42MzQyNCAwTDkwMC43MDIzNDggNzE0LjA5ODg4MUM5MDAuNzAxMzI1IDcxNC4wOTg4ODEgOTAwLjcwMTMyNSA1MzQuNDY0NjQxIDcyMS4wNjgxMDggNTM0LjQ2NDY0MUw3MjEuMDY4MTA4IDUzNC40NjQ2NDF6TTg0MC44MjI1NjIgODMzLjg1NDM1OSA3MjEuMDY4MTA4IDgzMy44NTQzNTljLTE5Ljk5ODQ3MyAwLTExOS43NTg1NDgtNS43ODc4Mi0xMTkuNzU4NTQ4LTExOS43NTQ0NTRMNjAxLjMwOTU2IDU5NC4zNDAzMzNsMTE5Ljc1ODU0OCAwYzEwOS4zNzQwMzYgMCAxMTkuMzE1NDU2IDkyLjAwOTU1NCAxMTkuNzU0NDU0IDExOS43NTg1NDhMODQwLjgyMjU2MiA4MzMuODU0MzU5IDg0MC44MjI1NjIgODMzLjg1NDM1OXpNODQwLjgyMjU2MiA4MzMuODU0MzU5IiAvPgo8cGF0aCBjbGFzcz0ic3ZncGF0aCIgZGF0YS1pbmRleD0icGF0aF8zIiBmaWxsPSIjZWE4MDEwIiBkPSJNMTIyLjI4NTYwMiA3MTQuMDk4ODgxbDAgMTc5LjYzNDI0TDMwMS45MTk4NDIgODkzLjczMzEyMWMwIDAgMTc5LjYzNDI0IDAgMTc5LjYzNDI0LTE3OS42MzQyNEw0ODEuNTU0MDgyIDUzNC40NjQ2NDEgMzAxLjkxOTg0MiA1MzQuNDY0NjQxQzEyMi4yODU2MDIgNTM0LjQ2NDY0MSAxMjIuMjg1NjAyIDcxNC4wOTg4ODEgMTIyLjI4NTYwMiA3MTQuMDk4ODgxTDEyMi4yODU2MDIgNzE0LjA5ODg4MXpNNDIxLjY3NDI5NyA3MTQuMDk4ODgxYzAgMTA5LjM3NDAzNi05Mi4wMTA1NzcgMTE5LjMxNTQ1Ni0xMTkuNzU0NDU0IDExOS43NTQ0NTRMMTgyLjE2NTM4OCA4MzMuODUzMzM1IDE4Mi4xNjUzODggNzE0LjA5ODg4MWMwLTE5Ljk5ODQ3MyA1Ljc4NzgyLTExOS43NTg1NDggMTE5Ljc1NDQ1NC0xMTkuNzU4NTQ4bDExOS43NTQ0NTQgMEw0MjEuNjc0Mjk3IDcxNC4wOTg4ODEgNDIxLjY3NDI5NyA3MTQuMDk4ODgxek00MjEuNjc0Mjk3IDcxNC4wOTg4ODEiIC8+Cgo8L3N2Zz4K',
  sequence: 10001
};
export default Vue.extend({
  name: 'PageCategoryManage',
  layout: 'admin',
  data () {
    return {
      uid: '',
      modalTitle: '',
      isModalShow: false,
      confirmLoading: false,
      categories: [],
      otherCategoryId: otherCategoryItem._id,
      imageUrl: '',
      imgLoading: false,
      cateNameOpts: {
        rules: [
          {
            required: true,
            message: '名称不能为空！'
          }
        ]
      },
      sequenceOpts: {
        rules: [
          {
            required: true,
            message: '排序不能为空！'
          }
        ]
      },
      selectedRowKeys: [],
      tableColumns: [
        {
          title: '排序',
          dataIndex: 'sequence',
          width: 80
        },
        {
          title: '分类图标',
          key: 'img',
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'img' }
        },
        {
          title: '分类名称',
          dataIndex: 'cateName',
          width: 150
        },
        {
          title: 'Alias',
          dataIndex: 'alias'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          width: 160,
          align: 'center',
          scopedSlots: { customRender: 'createTime' }
        },
        {
          title: '修改时间',
          dataIndex: 'modifyTime',
          width: 160,
          align: 'center',
          scopedSlots: { customRender: 'modifyTime' }
        },
        {
          title: '操作',
          key: 'action',
          width: 130,
          align: 'center',
          fixed: 'right',
          scopedSlots: { customRender: 'action' }
        }
      ],
      isLoading: false
    };
  },
  computed: {
    form () {
      return this.$form.createForm(this);
    },
    aliasOpts (): object {
      return {
        rules: [
          {
            required: true,
            message: 'Alias不能为空！'
          },
          {
            validator: this.checkAlias
          }
        ]
      };
    },
    imgOpts (): object {
      return {
        rules: [
          {
            required: !this.uid,
            message: '图标不能为空！'
          }
        ]
      };
    },
    rowSelection (): object {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: selectedRowKeys => {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.selectedRowKeys = selectedRowKeys;
        },
        getCheckboxProps: record => ({
          props: {
            disabled:
              [allCategoryItem._id, this.otherCategoryId].includes(record._id)
          }
        })
      };
    },
    delDisabled (): boolean {
      return this.selectedRowKeys.length === 0;
    },
    maxSequence (): number {
      const arr = (this.categories as any[]).filter((item: any) => {
        return (
          ![allCategoryItem._id, this.otherCategoryId].includes(item._id)
        );
      });
      if (arr.length) {
        return arr[arr.length - 1].sequence + 10;
      }
      return 0;
    }
  },
  created () {
    this.getCategories();
  },
  methods: {
    async getCategories () {
      this.selectedRowKeys = [];
      this.isLoading = true;
      const { code, data }: IResp = await this.$axios.$get(
        '/api/admin/categories'
      );
      if (code === 1) {
        data.unshift(allCategoryItem);
        this.categories = data;
      } else if (process.client) {
        this.$message.error('请求失败！');
      }
      this.isLoading = false;
    },

    checkAlias (_rule, value, callback): void {
      if (value) {
        this.$axios
          .$get('/api/admin/checkCategoryAlias', {
            params: {
              alias: value,
              excludeUid: this.uid
            }
          })
          .then(({ code, data }: IResp) => {
            if (code === 1 && !data.exists) {
              callback();
            } else {
              // eslint-disable-next-line standard/no-callback-literal
              callback('alias已存在！');
            }
          });
      } else {
        callback();
      }
    },

    addNew () {
      this.uid = '';
      this.imageUrl = '';
      this.modalTitle = '新增分类';
      this.isModalShow = true;
      this.$nextTick(() => {
        this.form.setFieldsValue({
          sequence: this.maxSequence
        });
      });
    },

    editCategory (item) {
      this.uid = item._id;
      this.modalTitle = '编辑分类';
      this.isModalShow = true;
      this.$nextTick(() => {
        this.imageUrl = item.img;
        this.form.setFieldsValue({
          cateName: item.cateName,
          alias: item.alias,
          sequence: item.sequence
        });
      });
    },

    onSelectChange (selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },

    del (uid) {
      const self = this;
      this.$confirm({
        title: '确定要删除吗？',
        content: '删除后不可恢复，该分类下的所有文章将被自动归入未分类！',
        okText: '确定',
        cancelText: '取消',
        class: 'del2',
        onOk () {
          return new Promise((resolve, reject) => {
            self.$axios
              .$delete('/api/admin/category', {
                params: {
                  uids: uid
                }
              })
              .then(resp => {
                if (resp.code === 1) {
                  self.getCategories().then(resolve);
                  self.$message.success('删除成功！');
                } else {
                  console.error(resp.message);
                  reject(resp.message);
                  self.$message.error('操作失败！');
                }
              });
          });
        }
      });
    },

    delAll () {
      const self = this;
      this.$confirm({
        title: `确定要删除这${self.selectedRowKeys.length}项吗？`,
        content: '删除后不可恢复，该分类下的所有文章将被自动归入未分类！',
        okText: '确定',
        cancelText: '取消',
        class: 'del2',
        onOk () {
          return new Promise((resolve, reject) => {
            self.$axios
              .$delete('/api/admin/category', {
                params: {
                  uids: self.selectedRowKeys
                }
              })
              .then(resp => {
                if (resp.code === 1) {
                  self.getCategories().then(resolve);
                  self.$message.success('删除成功！');
                } else {
                  console.error(resp.message);
                  reject(resp.message);
                  self.$message.error('操作失败！');
                }
              });
          });
        }
      });
    },

    beforeUpload (file) {
      const isImg = file.type.indexOf('image/') === 0;
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImg) {
        this.$message.error('只允许上传图片！');
      } else if (!isLt2M) {
        this.$message.error('图片体积不能大于2M！');
      }
      return isImg && isLt2M;
    },

    getBase64 (img, callback) {
      const reader = new FileReader();
      reader.addEventListener('load', () => callback(reader.result));
      reader.readAsDataURL(img);
    },

    uploadChange (info) {
      if (info.file.status === 'uploading') {
        this.imgLoading = true;
        return;
      }
      if (info.file.status === 'done') {
        this.getBase64(info.file.originFileObj, imageUrl => {
          this.imageUrl = imageUrl;
          this.imgLoading = false;
        });
      }
    },

    saveCategory () {
      this.form.validateFieldsAndScroll((error, values) => {
        if (!error) {
          this.confirmLoading = true;
          const data = {
            cateName: values.cateName,
            alias: values.alias,
            sequence: values.sequence,
            img: this.imageUrl
          };
          const done = resp => {
            if (resp.code === 1) {
              this.getCategories();
              this.$message.success('保存成功！');
            } else {
              console.error(resp.message);
              this.$message.error('操作失败！');
            }
            this.confirmLoading = false;
            this.isModalShow = false;
          };
          if (!this.uid) {
            // 新增
            this.$axios.$post('/api/admin/category', data).then(resp => {
              done(resp);
            });
          } else {
            // 编辑
            this.$axios
              .$put('/api/admin/category', data, {
                params: {
                  uid: this.uid
                }
              })
              .then(resp => {
                done(resp);
              });
          }
        }
      });
    }
  }
});
</script>
<style scoped>
.action-td .ant-btn {
  width: 32px;
  padding: 0;
}

.btn-wrap {
  margin-bottom: 10px;
}

.tb-img {
  width: 25px;
  height: 25px;
}

.ant-table-body {
  overflow-x: auto !important;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #777;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

.img-tip {
  font-size: 12px;
  line-height: 1;
  margin: 2px 0 17px;
}

.img-tip i {
  position: relative;
  top: -1px;
}
</style>
<style>
.has-error .ant-upload.ant-upload-select.ant-upload-select-picture-card {
  border-color: #f5222d;
}
</style>
