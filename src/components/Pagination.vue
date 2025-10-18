<template>
  <div class="pagination">
    <button 
      class="page-btn" 
      :class="{ 'disabled': currentPage === 1 }"
      @click="changePage(1)" 
      :disabled="currentPage === 1"
    >
      首页
    </button>
    <button 
      class="page-btn" 
      :class="{ 'disabled': currentPage === 1 }"
      @click="changePage(currentPage - 1)" 
      :disabled="currentPage === 1"
    >
      上一页
    </button>
    
    <template v-for="page in displayedPages" :key="page">
      <button 
        v-if="page !== '...'" 
        class="page-btn" 
        :class="{ 'active': page === currentPage }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
      <span v-else class="ellipsis">...</span>
    </template>
    
    <button 
      class="page-btn" 
      :class="{ 'disabled': currentPage === totalPages }"
      @click="changePage(currentPage + 1)" 
      :disabled="currentPage === totalPages"
    >
      下一页
    </button>
    <button 
      class="page-btn" 
      :class="{ 'disabled': currentPage === totalPages }"
      @click="changePage(totalPages)" 
      :disabled="currentPage === totalPages"
    >
      尾页
    </button>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'Pagination',
  props: {
    totalPages: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    },
    maxVisiblePages: {
      type: Number,
      default: 7
    }
  },
  emits: ['page-change'],
  setup(props, { emit }) {
    const displayedPages = computed(() => {
      if (props.totalPages <= props.maxVisiblePages) {
        return Array.from({ length: props.totalPages }, (_, i) => i + 1);
      }
      
      const halfVisible = Math.floor(props.maxVisiblePages / 2);
      let startPage = Math.max(props.currentPage - halfVisible, 1);
      let endPage = Math.min(startPage + props.maxVisiblePages - 1, props.totalPages);
      
      if (endPage - startPage + 1 < props.maxVisiblePages) {
        startPage = Math.max(endPage - props.maxVisiblePages + 1, 1);
      }
      
      const pages = [];
      
      // 总是显示首页
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      // 中间页码
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // 总是显示末页
      if (endPage < props.totalPages) {
        if (endPage < props.totalPages - 1) pages.push('...');
        pages.push(props.totalPages);
      }
      
      return pages;
    });
    
    const changePage = (page) => {
      if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
        emit('page-change', page);
      }
    };
    
    return {
      displayedPages,
      changePage
    };
  }
};
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 8px;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  background-color: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 10px;
}

.page-btn:hover:not(.disabled):not(.active) {
  color: #3b82f6;
  border-color: #3b82f6;
}

.page-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
  cursor: default;
}

.page-btn.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #999;
}
</style>

