<script setup>
import { ref, computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

const props = defineProps({
  title: String,
  method: {
    type: String,
    default: 'GET'
  },
  path: String,
  baseUrl: String,
  description: String,
  params: {
    type: Array,
    default: () => []
  },
  response: {
    type: Object,
    default: null
  },
  options: {
    type: Array,
    default: () => []
  }
})

const activeOptionIndex = ref(0)

// 合并 props 和 options
const currentApi = computed(() => {
  let base = {}
  
  if (props.options && props.options.length > 0) {
    base = props.options[activeOptionIndex.value]
  }

  const finalBaseUrl = props.baseUrl || base.baseUrl || frontmatter.value.apiBaseUrl || 'https://status.awmc.cc'

  return {
    title: props.title || base.title || '未命名接口',
    method: props.method || base.method || 'GET',
    path: props.path || base.path || '/',
    baseUrl: finalBaseUrl,
    description: props.description || base.description || '',
    params: props.params.length > 0 ? props.params : (base.params || []),
    response: props.response || base.response || {}
  }
})

// 管理参数值
const paramValues = ref({})
const isExpanded = ref(false)
const copySuccess = ref(false)
const isLoading = ref(false)
const executionResult = ref(null)

// 初始化参数值
import { watchEffect } from 'vue'
watchEffect(() => {
  const vals = {}
  currentApi.value.params.forEach(p => {
    vals[p.name] = p.value || ''
  })
  paramValues.value = vals
})

const copyUrl = () => {
  const fullUrl = getFullUrl()
  navigator.clipboard.writeText(fullUrl)
  copySuccess.value = true
  setTimeout(() => copySuccess.value = false, 2000)
}

const getFullUrl = () => {
  let url = currentApi.value.baseUrl + currentApi.value.path
  const query = new URLSearchParams()
  
  // 简单的路径参数替换 (例如 /api/:id)
  Object.keys(paramValues.value).forEach(key => {
    if (url.includes(`:${key}`)) {
      url = url.replace(`:${key}`, paramValues.value[key])
    } else {
      query.append(key, paramValues.value[key])
    }
  })

  const queryString = query.toString()
  return queryString ? `${url}?${queryString}` : url
}

const runRequest = async () => {
  isLoading.value = true
  executionResult.value = null
  try {
    const url = getFullUrl()
    const options = {
      method: currentApi.value.method,
    }
    
    const response = await fetch(url, options)
    const data = await response.json()
    executionResult.value = data
  } catch (e) {
    executionResult.value = { error: e.message }
  } finally {
    isLoading.value = false
  }
}

const formatMethod = (method) => {
  const colors = {
    'GET': '#00b386',
    'POST': '#e6a23c',
    'PUT': '#409eff',
    'DELETE': '#f56c6c'
  }
  return colors[method] || 'var(--vp-c-brand-1)'
}
</script>

<template>
  <div class="api-demo-container">
    <div class="api-header" @click="isExpanded = !isExpanded">
      <div class="api-info">
        <span class="method-badge" :style="{ backgroundColor: formatMethod(currentApi.method) }">{{ currentApi.method }}</span>
        <span class="api-title">{{ currentApi.title }}</span>
      </div>
      <div class="api-actions">
        <span class="api-path">{{ currentApi.path }}</span>
        <span :class="['arrow', { rotated: isExpanded }]">▼</span>
      </div>
    </div>

    <transition name="slide">
      <div v-if="isExpanded" class="api-body">
        <!-- 选项切换 -->
        <div v-if="props.options && props.options.length > 1" class="options-tabs">
          <button 
            v-for="(opt, index) in props.options" 
            :key="index"
            :class="['tab-btn', { active: activeOptionIndex === index }]"
            @click="activeOptionIndex = index"
          >
            {{ opt.title || `选项 ${index + 1}` }}
          </button>
        </div>

        <div class="api-description">
          {{ currentApi.description }}
        </div>

        <!-- 请求部分 -->
        <div class="section-title">请求地址</div>
        <div class="url-box">
          <code class="full-url">{{ getFullUrl() }}</code>
          <div class="url-actions">
            <button class="run-btn" @click.stop="runRequest" :disabled="isLoading">
              {{ isLoading ? '运行中...' : '运行' }}
            </button>
            <button class="copy-btn" @click.stop="copyUrl">
              {{ copySuccess ? '已复制' : '复制' }}
            </button>
          </div>
        </div>

        <!-- 参数部分 -->
        <div class="section-title">请求参数 (Query)</div>
        <table class="params-table">
          <thead>
            <tr>
              <th>参数名</th>
              <th>类型</th>
              <th>说明</th>
              <th>值 (可修改)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="param in currentApi.params" :key="param.name">
              <td><code class="param-name">{{ param.name }}</code></td>
              <td><span class="param-type">{{ param.type }}</span></td>
              <td class="param-desc">{{ param.desc }}</td>
              <td>
                <input 
                  v-model="paramValues[param.name]" 
                  class="param-input"
                  :placeholder="param.required"
                />
              </td>
            </tr>
            <tr v-if="currentApi.params.length === 0">
              <td colspan="4" style="text-align: center; color: var(--vp-c-text-3);">无需参数</td>
            </tr>
          </tbody>
        </table>

        <!-- 响应预览 -->
        <div class="section-title">响应示例 (JSON)</div>
        <div v-if="executionResult" class="response-header">
          实际响应结果：
          <button class="clear-btn" @click="executionResult = null">清除</button>
        </div>
        <div class="response-box" :class="{ 'execution-res': executionResult }">
          <pre><code>{{ JSON.stringify(executionResult || currentApi.response, null, 2) }}</code></pre>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.api-demo-container {
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  overflow: hidden;
  font-family: var(--vp-font-family-base);
}

.api-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background-color: var(--vp-c-bg-alt);
  transition: background-color 0.2s;
}

.api-header:hover {
  filter: brightness(0.95);
}

.api-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-badge {
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 48px;
  text-align: center;
}

.api-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.api-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--vp-c-text-2);
}

.api-path {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
}

.arrow {
  font-size: 0.7rem;
  transition: transform 0.3s;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.api-body {
  padding: 16px;
  border-top: 1px solid var(--vp-c-divider);
}

.api-description {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 1.2rem 0 0.6rem;
  padding-left: 8px;
  border-left: 3px solid var(--vp-c-brand-1);
}

.url-box {
  display: flex;
  background-color: var(--vp-c-bg-alt);
  padding: 8px 12px;
  border-radius: 6px;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--vp-c-divider);
  gap: 12px;
}

.full-url {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  word-break: break-all;
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

/* 选项切换样式 */
.options-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 1.2rem;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 8px;
  overflow-x: auto;
}

.tab-btn {
  font-size: 0.85rem;
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.tab-btn.active {
  background-color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}

.url-actions {
  display: flex;
  gap: 8px;
}

.run-btn {
  font-size: 0.75rem;
  padding: 4px 10px;
  background-color: #00b386;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.run-btn:hover {
  filter: brightness(1.1);
}

.run-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.copy-btn {
  font-size: 0.75rem;
  padding: 4px 10px;
  background-color: var(--vp-c-brand-1);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.copy-btn:hover {
  filter: brightness(1.1);
}

.param-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
}

.param-input:focus {
  border-color: var(--vp-c-brand-1);
  outline: none;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-top: 1rem;
}

.clear-btn {
  font-size: 0.7rem;
  color: var(--vp-c-brand-1);
  cursor: pointer;
}

.execution-res {
  border: 1px solid var(--vp-c-brand-1) !important;
}

.params-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 0.85rem;
}

.params-table th {
  text-align: left;
  padding: 8px;
  background-color: var(--vp-c-bg-alt);
  border-bottom: 2px solid var(--vp-c-divider);
}

.params-table td {
  padding: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.param-name {
  color: var(--vp-c-brand-1);
}

.param-type {
  color: #00b386;
}

.param-required {
  color: #f56c6c;
}

.response-box {
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.response-box pre {
  margin: 0;
  font-size: 0.85rem;
  color: #dcdcdc;
}

/* 动画 */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease-out;
  max-height: 1000px;
}

.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}

/* 适配深色模式 */
:deep(.dark) .api-header {
  background-color: #2a2a2a;
}
</style>
