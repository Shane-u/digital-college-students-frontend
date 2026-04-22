<template>
  <div :class="['sidebar', { 'sidebar-open': isOpen, 'sidebar-closed': !isOpen }]">
    <div class="sidebar-header">
      <button 
        @click="toggleOpen"
        class="sidebar-toggle"
      >
        <MenuIcon />
      </button>
      <button v-if="isOpen" class="sidebar-search" title="回到首页" @click="goHome">
        <img :src="homeIcon" alt="回到首页" class="sidebar-home-icon" />
      </button>
    </div>

    <div class="sidebar-new-chat">
      <button 
        @click="onNewChat"
        :class="['new-chat-btn', { 'new-chat-btn-open': isOpen, 'new-chat-btn-closed': !isOpen }]"
      >
        <PlusIcon />
        <span v-if="isOpen">新的对话</span>
      </button>
      <div
        v-if="isOpen"
        :class="['learning-path-row', { 'learning-path-row-active': scene === 'learningPath' }]"
        @click="handleLearningPathClick"
      >
        <img :src="learningPathIcon" alt="学习路径规划" class="learning-path-icon" />
        <span class="learning-path-text">学习路径规划</span>
      </div>
      <router-link
        v-if="isOpen"
        to="/learning-path-graph"
        class="learning-path-row learning-path-link"
        title="学习路径图谱"
      >
        <span class="learning-path-svg-icon" aria-hidden="true">
         <svg t="1773038943631" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5130" width="200" height="200"><path d="M517.012082 69.446688C539.13749 42.083429 579.234148 37.929271 606.507099 59.964371c27.272952 22.125408 31.517418 62.131758 9.39201 89.495017-10.024164 12.372167-24.202487 20.499868-39.916042 22.84787l-6.231237 212.855455c12.64309 2.618926 24.834642 7.947085 35.49096 15.89417l123.360438-185.311579c-25.28618-24.383103-26.098951-64.570068-1.806156-89.946556 24.383103-25.28618 64.570068-26.098951 89.946556-1.806156 25.28618 24.383103 26.098951 64.570068 1.806156 89.946556-18.332481 19.145251-46.689126 24.834642-70.981921 14.358938L621.859423 417.221977c7.224623 9.121087 12.462475 19.145251 15.713555 29.620954l214.300379-98.525795c-8.759855-34.046036 11.83032-68.724226 45.786049-77.393774 34.046036-8.759855 68.724226 11.83032 77.393773 45.786048 8.759855 34.046036-11.83032 68.724226-45.786048 77.393774-15.623247 3.973543-32.149572 1.896464-46.327895-5.870006L779.627128 513.309463l103.853955 12.733398c2.528618-8.037393 6.682776-15.532939 12.191551-21.944792l5.147544-5.32816c25.737719-23.931564 65.924685-22.576947 89.856248 3.160773s22.576947 65.924685-3.160772 89.856248-65.924685 22.576947-89.856248-3.160772c-10.20478-10.927242-16.165094-25.015257-16.977864-39.916042l-118.212894-14.539554-88.1404 106.743804c28.9888 17.790634 46.056972 51.204515 42.534967 85.973014L848.622277 757.682335c13.907399-32.23988 51.294823-47.140665 83.534703-33.233265 32.23988 13.907399 47.140665 51.294823 33.233266 83.534703-13.907399 32.23988-51.294823 47.140665-83.534703 33.233266-24.292795-10.475703-39.645119-34.949114-38.38081-61.409296l-132.029985-30.704647c-17.519711 46.598818-69.536996 70.169151-116.045506 52.559132-37.929271-14.26863-61.680219-52.107593-57.9776-92.475174l-97.53241-21.764177c-8.850163 17.429403-23.118794 31.607726-40.638504 40.277273l39.464503 77.393774c45.244201-20.590176 98.706412-0.632155 119.296587 44.702354 20.590176 45.244201 0.632155 98.706412-44.702355 119.296587s-98.706412 0.632155-119.296587-44.702354c-16.977864-37.297116-6.592468-81.457624 25.28618-107.285652L377.486551 735.286004c-16.436017 3.341388-33.504189 2.077079-49.308052-3.702619l-37.748655 84.07655c39.554811 30.253109 47.050357 86.785784 16.887556 126.340594-30.253109 39.554811-86.785784 47.050357-126.340594 16.887556s-47.050357-86.785784-16.887557-126.340594c26.098951-34.136344 72.607461-45.063586 111.168887-26.279566l-4.605698-1.986771 37.477732-83.173473c-13.275245-9.211394-23.931564-21.854485-30.704647-36.574653l-81.186701 18.964635c7.134315 49.217744-26.911721 94.913484-76.129465 102.0478-49.217744 7.134315-94.913484-26.911721-102.0478-76.129465-7.134315-49.217744 26.911721-94.913484 76.129465-102.0478 40.638504-5.870006 80.103007 16.436017 95.997178 54.27498l80.464238-18.874327c-3.160773-17.880942-0.81277-36.30373 6.592469-52.920363l-62.04145-51.926978c-32.691419 37.477732-89.585325 41.360967-127.063057 8.669547-37.477732-32.691419-41.360967-89.585325-8.669547-127.063056 32.691419-37.477732 89.585325-41.360967 127.063057-8.669548 30.885263 26.911721 39.735426 71.343152 21.402945 108.008114l61.409295 51.565746c12.281859-15.171708 29.440339-26.279566 49.127437-30.975571v-69.266073c-49.39836-6.321545-84.257166-51.385131-78.025928-100.78349 6.321545-49.39836 51.385131-84.257166 100.78349-78.025928 49.39836 6.321545 84.257166 51.385131 78.025928 100.78349-5.147544 40.728812-37.297116 72.788077-78.025928 78.025928v66.827763c24.563718 0.541847 46.689126 10.836934 62.673605 27.272952l62.583296-48.404974-4.966928-5.689391c-29.169415-36.032807-26.189258-88.321016 6.863392-120.922127l6.50216-5.779698c15.442632-12.552782 33.775112-19.054943 52.197901-19.958021l6.231238-211.862069c-34.316959-7.314931-56.352059-41.090043-49.037129-75.407003 2.077079-9.843549 6.411853-19.054943 12.733398-26.821413z m112.794427 448.468472c-24.563718 43.25743-79.561161 58.429138-122.818591 33.86542-0.722462-0.451539-1.535232-0.903078-2.257695-1.354617L437.631537 602.352941c11.01755 19.235559 14.449246 41.902813 9.753241 63.576682l95.003792 21.041715c16.977864-46.779434 68.724226-70.891613 115.50366-53.823441 0.180616 0.090308 0.270923 0.090308 0.451539 0.180615l83.895935-101.505953-112.433195-13.907399z m231.549166-149.007849L641.546521 469.961725c0.361231 8.850163-0.541847 17.610019-2.799542 26.189258L759.488491 510.871153l109.723962-132.752448c-2.889849-2.799541-5.508775-5.870006-7.856778-9.211394z" fill="#a4579d" p-id="5131"></path></svg>
        </span>
        <span class="learning-path-text">学习路径图谱</span>
      </router-link>
      <router-link
        v-if="isOpen"
        to="/flashcard-graph"
        class="learning-path-row learning-path-link"
        title="闪卡图谱"
      >
        <span class="learning-path-svg-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 1024 1024" fill="#CE89D1" xmlns="http://www.w3.org/2000/svg">
            <path d="M688 925.504l-8.928-2.272a61.472 61.472 0 0 1-8.8-3.2 6.944 6.944 0 0 0-1.248-0.352 25.312 25.312 0 0 1-6.176-1.984c-3.424-1.664-6.4-1.696-10.048-3.2a25.6 25.6 0 0 0-6.4-1.984c-3.2-0.608-6.016-2.816-9.248-3.2a17.728 17.728 0 0 1-5.184-1.728 25.6 25.6 0 0 0-6.4-1.984c-3.2-0.576-6.016-2.72-9.184-3.2-3.904-0.576-7.392-2.944-11.68-3.808a27.456 27.456 0 0 1-6.208-2.304 4.704 4.704 0 0 0-0.96-0.352l-3.712-0.896q-8.672-2.624-55.936-18.56c-4.032-1.376-7.808-1.856-12.064-3.2q-26.624-9.28-53.024-17.888-3.424-1.12-5.536-1.568c-3.968-0.896-6.784-2.88-10.432-3.456s-7.104-3.2-11.2-3.808c-3.2-0.576-5.856-2.56-9.248-3.2s-6.912-2.88-10.752-3.584a17.888 17.888 0 0 1-4.896-1.568c-3.616-1.792-7.232-1.856-11.04-3.808a18.816 18.816 0 0 0-4.736-1.504 29.6 29.6 0 0 1-6.976-2.464 8.096 8.096 0 0 0-2.112-0.704c-4.384-0.832-7.712-2.784-11.648-3.744s-6.784-2.72-10.88-3.52a25.6 25.6 0 0 1-6.144-2.304 8.672 8.672 0 0 0-1.728-0.608c-7.488-1.728-16-4.896-23.328-7.328q-18.144-5.952-25.6-8.512a85.504 85.504 0 0 1-9.6-3.2 9.312 9.312 0 0 0-1.696-0.64 52.928 52.928 0 0 1-9.824-3.456 19.2 19.2 0 0 0-5.76-1.76 19.872 19.872 0 0 1-8.992-4.544 53.44 53.44 0 0 0-2.24-2.048 9.824 9.824 0 0 0-1.696-1.024l-4.832-2.368-0.288-0.192q-7.2-6.848-14.976-15.104a13.696 13.696 0 0 1-2.56-4 0.672 0.672 0 0 1 0-0.64 0.64 0.64 0 0 1 0.544-0.288h355.392a73.408 73.408 0 0 0 12.32-0.864 157.216 157.216 0 0 0 23.36-5.056q6.4-2.144 7.36-2.336a27.008 27.008 0 0 0 7.264-2.464q3.648-1.856 11.616-5.088a174.592 174.592 0 0 0 18.912-10.4c3.712-2.08 8.448-6.656 12.8-9.6a44.8 44.8 0 0 0 5.12-3.84 125.024 125.024 0 0 0 22.816-25.344 17.088 17.088 0 0 1 1.792-2.464 25.376 25.376 0 0 0 5.088-7.008 22.048 22.048 0 0 1 4.096-6.08 1.824 1.824 0 0 0 0.32-0.448l9.6-18.88a5.312 5.312 0 0 0 0.48-1.472l0.512-2.944a8 8 0 0 1 0.576-1.888 86.976 86.976 0 0 0 5.344-15.008q2.016-9.152 3.008-14.56a136 136 0 0 0 1.952-23.68v-270.016a8.352 8.352 0 0 1 1.312-4.704 0.896 0.896 0 0 1 0.576-0.384 0.896 0.896 0 0 1 0.672 0.16 18.592 18.592 0 0 0 7.296 3.488q3.552 0.8 6.08 1.6c9.088 2.944 18.368 5.28 26.56 8.192a18.4 18.4 0 0 0 3.2 0.864c4.064 0.672 7.328 3.008 10.72 3.488s6.88 3.008 10.624 3.52 6.048 2.72 9.6 3.2a27.264 27.264 0 0 1 4.8 1.248q5.888 2.08 14.656 4.384a20.544 20.544 0 0 1 3.456 1.248 39.68 39.68 0 0 0 9.6 3.744 24.576 24.576 0 0 1 8.736 3.872q6.976 5.056 8.704 5.952a7.264 7.264 0 0 1 1.6 1.12 106.144 106.144 0 0 1 9.92 8.96 107.264 107.264 0 0 1 10.784 13.504q1.536 2.56 4.896 7.2a17.952 17.952 0 0 1 2.56 5.152 124.8 124.8 0 0 1 5.152 16.928c0.48 3.68 1.888 7.168 2.176 11.328a107.744 107.744 0 0 1-0.672 20.288 54.4 54.4 0 0 1-1.696 8.832 101.408 101.408 0 0 1-4.544 15.52c-1.472 3.008-1.344 6.08-2.976 9.152s-1.888 7.36-3.584 10.816a15.456 15.456 0 0 0-1.696 4.96c-0.416 3.552-2.752 6.624-3.2 10.208s-3.2 7.04-3.648 10.656-2.944 6.656-3.424 10.56-3.2 7.04-3.584 11.36a3.2 3.2 0 0 1-0.256 1.056l-2.528 5.696a5.984 5.984 0 0 0-0.448 1.632 23.168 23.168 0 0 1-2.752 8.064c-0.896 1.632-0.864 5.088-1.984 7.296a21.216 21.216 0 0 0-2.144 6.08c-0.544 3.744-3.2 7.2-3.616 10.432-0.384 3.84-2.784 6.72-3.392 10.56a16.608 16.608 0 0 1-1.632 5.024 26.368 26.368 0 0 0-2.272 7.136 6.592 6.592 0 0 1-0.384 1.312l-2.24 5.184a4.64 4.64 0 0 0-0.32 1.024 23.072 23.072 0 0 1-1.6 5.792 19.808 19.808 0 0 0-1.792 5.024q0 0.864-3.2 10.4a56.864 56.864 0 0 1-2.016 5.728c-1.088 2.432-1.472 4.8-2.496 7.712q-3.2 8.64-5.856 17.344-2.208 6.944-8.384 25.088-4.64 13.664-9.216 27.424-4.896 14.688-11.264 34.4-1.824 5.696-2.752 8.896-1.888 6.656-2.656 8.896l-27.392 82.496a56.672 56.672 0 0 1-3.968 8.96 4.352 4.352 0 0 0-0.48 1.44 46.016 46.016 0 0 1-7.776 16 38.4 38.4 0 0 1-4.448 5.824 139.104 139.104 0 0 1-16.512 16.736 8.544 8.544 0 0 1-1.728 1.088 66.912 66.912 0 0 0-10.88 6.944l-0.512 0.32-2.592 1.312a13.92 13.92 0 0 1-2.272 0.896 66.976 66.976 0 0 0-10.656 4.064 7.84 7.84 0 0 1-2.24 0.704c-5.152 0.768-9.44 2.016-14.752 2.336-2.592 0-5.216 0.256-7.776 0.256a86.4 86.4 0 0 1-21.824-2.496zM599.872 691.2l-413.664-0.8A90.368 90.368 0 0 1 96 599.904l0.736-413.696A90.368 90.368 0 0 1 187.232 96l413.664 0.736A90.368 90.368 0 0 1 691.2 187.232l-0.736 413.696A90.368 90.368 0 0 1 600 691.2zM185.6 186.752v324.448a1.152 1.152 0 0 0 1.152 1.152h413.664a1.152 1.152 0 0 0 1.152-1.152V186.752a1.152 1.152 0 0 0-1.152-1.152H186.816a1.152 1.152 0 0 0-1.216 1.152z"></path>
          </svg>
        </span>
        <span class="learning-path-text">闪卡图谱</span>
      </router-link>
    </div>

    <div v-if="isOpen" class="sidebar-section-divider"></div>

    <div v-if="isOpen" class="sidebar-content">

      <div class="sidebar-section">
        <div v-if="!isBatchMode" class="sidebar-section-header">
          <h3 class="sidebar-section-title">最近对话</h3>
          <button class="sidebar-refresh-btn" @click.stop>
            <ClockIcon />
          </button>
        </div>
        <div v-else class="sidebar-batch-header">
          <button class="sidebar-batch-select-all" @click="toggleSelectAll">
            <CheckSquareIcon v-if="selectedSessions.size === sessions.length" />
            <SquareIcon v-else />
            <span>全选</span>
          </button>
          <span class="sidebar-batch-count">已选{{ selectedSessions.size }}条</span>
          <button class="sidebar-batch-cancel" @click="exitBatchMode">取消</button>
          <button class="sidebar-batch-delete" @click="deleteSelected">删除</button>
        </div>
        <div class="sidebar-chats">
          <div 
            v-for="session in sortedSessions"
            :key="session.id"
            @click="handleItemClick(session.id)"
            :class="['sidebar-chat-item', { 
              'active': currentSessionId === session.id && !isBatchMode,
              'selected': isBatchMode && selectedSessions.has(session.id)
            }]"
          >
            <div v-if="isBatchMode" class="sidebar-chat-checkbox" @click.stop="toggleSelect(session.id)">
              <CheckSquareIcon v-if="selectedSessions.has(session.id)" />
              <SquareIcon v-else />
            </div>
            <template v-else>
              <img
                v-if="isLearningPathSession(session)"
                :src="learningPathIcon"
                alt="学习路径对话"
                class="sidebar-chat-session-icon"
              />
              <MessageSquareIcon v-else />
            </template>
            <span class="sidebar-chat-title" :title="session.title">{{ session.title }}</span>
            <PinIcon v-if="session.isPinned" class="sidebar-pin" />
            <button 
              v-if="isOpen && !isBatchMode" 
              class="sidebar-chat-more"
              @click.stop="openMenu(session.id, $event)"
            >
              <MoreVerticalIcon />
            </button>
          </div>
        </div>
      </div>
      
      <!-- 下拉菜单 -->
      <div 
        v-if="showMenu && menuPosition"
        class="sidebar-menu"
        :style="{ top: menuPosition.top + 'px', left: menuPosition.left + 'px' }"
        @click.stop
      >
        <button class="sidebar-menu-item" @click="handlePin">
          <PinMenuIcon />
          <span>置顶</span>
        </button>
        <button class="sidebar-menu-item" @click="handleRename">
          <PencilIcon />
          <span>重命名</span>
        </button>
        <button class="sidebar-menu-item" @click="handleDelete">
          <TrashIcon />
          <span>删除</span>
        </button>
        <button class="sidebar-menu-item" @click="handleBatchOperation">
          <LayersIcon />
          <span>批量操作</span>
        </button>
      </div>
      
      <!-- 重命名对话框 -->
      <div v-if="showRenameDialog" class="sidebar-rename-overlay" @click.stop="closeRenameDialog">
        <div class="sidebar-rename-dialog" @click.stop>
          <h3>重命名</h3>
          <input 
            v-model="renameValue" 
            @keyup.enter="confirmRename"
            @keyup.esc="closeRenameDialog"
            class="sidebar-rename-input"
            placeholder="请输入新名称"
            ref="renameInputRef"
          />
          <div class="sidebar-rename-actions">
            <button class="sidebar-rename-cancel" @click="closeRenameDialog">取消</button>
            <button class="sidebar-rename-confirm" @click="confirmRename">确定</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isOpen" class="sidebar-icons-closed">
      <button class="sidebar-icon-btn" title="学习路径规划" @click="handleLearningPathClick">
        <img :src="learningPathIcon" alt="学习路径规划" class="sidebar-icon-learning-path" />
      </button>
      <router-link to="/learning-path-graph" class="sidebar-icon-btn sidebar-icon-link" title="学习路径图谱">
        <span class="learning-path-svg-icon" aria-hidden="true">
          <svg t="1773038943631" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5130" width="200" height="200"><path d="M517.012082 69.446688C539.13749 42.083429 579.234148 37.929271 606.507099 59.964371c27.272952 22.125408 31.517418 62.131758 9.39201 89.495017-10.024164 12.372167-24.202487 20.499868-39.916042 22.84787l-6.231237 212.855455c12.64309 2.618926 24.834642 7.947085 35.49096 15.89417l123.360438-185.311579c-25.28618-24.383103-26.098951-64.570068-1.806156-89.946556 24.383103-25.28618 64.570068-26.098951 89.946556-1.806156 25.28618 24.383103 26.098951 64.570068 1.806156 89.946556-18.332481 19.145251-46.689126 24.834642-70.981921 14.358938L621.859423 417.221977c7.224623 9.121087 12.462475 19.145251 15.713555 29.620954l214.300379-98.525795c-8.759855-34.046036 11.83032-68.724226 45.786049-77.393774 34.046036-8.759855 68.724226 11.83032 77.393773 45.786048 8.759855 34.046036-11.83032 68.724226-45.786048 77.393774-15.623247 3.973543-32.149572 1.896464-46.327895-5.870006L779.627128 513.309463l103.853955 12.733398c2.528618-8.037393 6.682776-15.532939 12.191551-21.944792l5.147544-5.32816c25.737719-23.931564 65.924685-22.576947 89.856248 3.160773s22.576947 65.924685-3.160772 89.856248-65.924685 22.576947-89.856248-3.160772c-10.20478-10.927242-16.165094-25.015257-16.977864-39.916042l-118.212894-14.539554-88.1404 106.743804c28.9888 17.790634 46.056972 51.204515 42.534967 85.973014L848.622277 757.682335c13.907399-32.23988 51.294823-47.140665 83.534703-33.233265 32.23988 13.907399 47.140665 51.294823 33.233266 83.534703-13.907399 32.23988-51.294823 47.140665-83.534703 33.233266-24.292795-10.475703-39.645119-34.949114-38.38081-61.409296l-132.029985-30.704647c-17.519711 46.598818-69.536996 70.169151-116.045506 52.559132-37.929271-14.26863-61.680219-52.107593-57.9776-92.475174l-97.53241-21.764177c-8.850163 17.429403-23.118794 31.607726-40.638504 40.277273l39.464503 77.393774c45.244201-20.590176 98.706412-0.632155 119.296587 44.702354 20.590176 45.244201 0.632155 98.706412-44.702355 119.296587s-98.706412 0.632155-119.296587-44.702354c-16.977864-37.297116-6.592468-81.457624 25.28618-107.285652L377.486551 735.286004c-16.436017 3.341388-33.504189 2.077079-49.308052-3.702619l-37.748655 84.07655c39.554811 30.253109 47.050357 86.785784 16.887556 126.340594-30.253109 39.554811-86.785784 47.050357-126.340594 16.887556s-47.050357-86.785784-16.887557-126.340594c26.098951-34.136344 72.607461-45.063586 111.168887-26.279566l-4.605698-1.986771 37.477732-83.173473c-13.275245-9.211394-23.931564-21.854485-30.704647-36.574653l-81.186701 18.964635c7.134315 49.217744-26.911721 94.913484-76.129465 102.0478-49.217744 7.134315-94.913484-26.911721-102.0478-76.129465-7.134315-49.217744 26.911721-94.913484 76.129465-102.0478 40.638504-5.870006 80.103007 16.436017 95.997178 54.27498l80.464238-18.874327c-3.160773-17.880942-0.81277-36.30373 6.592469-52.920363l-62.04145-51.926978c-32.691419 37.477732-89.585325 41.360967-127.063057 8.669547-37.477732-32.691419-41.360967-89.585325-8.669547-127.063056 32.691419-37.477732 89.585325-41.360967 127.063057-8.669548 30.885263 26.911721 39.735426 71.343152 21.402945 108.008114l61.409295 51.565746c12.281859-15.171708 29.440339-26.279566 49.127437-30.975571v-69.266073c-49.39836-6.321545-84.257166-51.385131-78.025928-100.78349 6.321545-49.39836 51.385131-84.257166 100.78349-78.025928 49.39836 6.321545 84.257166 51.385131 78.025928 100.78349-5.147544 40.728812-37.297116 72.788077-78.025928 78.025928v66.827763c24.563718 0.541847 46.689126 10.836934 62.673605 27.272952l62.583296-48.404974-4.966928-5.689391c-29.169415-36.032807-26.189258-88.321016 6.863392-120.922127l6.50216-5.779698c15.442632-12.552782 33.775112-19.054943 52.197901-19.958021l6.231238-211.862069c-34.316959-7.314931-56.352059-41.090043-49.037129-75.407003 2.077079-9.843549 6.411853-19.054943 12.733398-26.821413z m112.794427 448.468472c-24.563718 43.25743-79.561161 58.429138-122.818591 33.86542-0.722462-0.451539-1.535232-0.903078-2.257695-1.354617L437.631537 602.352941c11.01755 19.235559 14.449246 41.902813 9.753241 63.576682l95.003792 21.041715c16.977864-46.779434 68.724226-70.891613 115.50366-53.823441 0.180616 0.090308 0.270923 0.090308 0.451539 0.180615l83.895935-101.505953-112.433195-13.907399z m231.549166-149.007849L641.546521 469.961725c0.361231 8.850163-0.541847 17.610019-2.799542 26.189258L759.488491 510.871153l109.723962-132.752448c-2.889849-2.799541-5.508775-5.870006-7.856778-9.211394z" fill="#a4579d" p-id="5131"></path></svg>
        </span>
      </router-link>
      <router-link to="/flashcard-graph" class="sidebar-icon-btn sidebar-icon-link" title="闪卡图谱">
        <span class="learning-path-svg-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 1024 1024" fill="#CE89D1" xmlns="http://www.w3.org/2000/svg">
            <path d="M688 925.504l-8.928-2.272a61.472 61.472 0 0 1-8.8-3.2 6.944 6.944 0 0 0-1.248-0.352 25.312 25.312 0 0 1-6.176-1.984c-3.424-1.664-6.4-1.696-10.048-3.2a25.6 25.6 0 0 0-6.4-1.984c-3.2-0.608-6.016-2.816-9.248-3.2a17.728 17.728 0 0 1-5.184-1.728 25.6 25.6 0 0 0-6.4-1.984c-3.2-0.576-6.016-2.72-9.184-3.2-3.904-0.576-7.392-2.944-11.68-3.808a27.456 27.456 0 0 1-6.208-2.304 4.704 4.704 0 0 0-0.96-0.352l-3.712-0.896q-8.672-2.624-55.936-18.56c-4.032-1.376-7.808-1.856-12.064-3.2q-26.624-9.28-53.024-17.888-3.424-1.12-5.536-1.568c-3.968-0.896-6.784-2.88-10.432-3.456s-7.104-3.2-11.2-3.808c-3.2-0.576-5.856-2.56-9.248-3.2s-6.912-2.88-10.752-3.584a17.888 17.888 0 0 1-4.896-1.568c-3.616-1.792-7.232-1.856-11.04-3.808a18.816 18.816 0 0 0-4.736-1.504 29.6 29.6 0 0 1-6.976-2.464 8.096 8.096 0 0 0-2.112-0.704c-4.384-0.832-7.712-2.784-11.648-3.744s-6.784-2.72-10.88-3.52a25.6 25.6 0 0 1-6.144-2.304 8.672 8.672 0 0 0-1.728-0.608c-7.488-1.728-16-4.896-23.328-7.328q-18.144-5.952-25.6-8.512a85.504 85.504 0 0 1-9.6-3.2 9.312 9.312 0 0 0-1.696-0.64 52.928 52.928 0 0 1-9.824-3.456 19.2 19.2 0 0 0-5.76-1.76 19.872 19.872 0 0 1-8.992-4.544 53.44 53.44 0 0 0-2.24-2.048 9.824 9.824 0 0 0-1.696-1.024l-4.832-2.368-0.288-0.192q-7.2-6.848-14.976-15.104a13.696 13.696 0 0 1-2.56-4 0.672 0.672 0 0 1 0-0.64 0.64 0.64 0 0 1 0.544-0.288h355.392a73.408 73.408 0 0 0 12.32-0.864 157.216 157.216 0 0 0 23.36-5.056q6.4-2.144 7.36-2.336a27.008 27.008 0 0 0 7.264-2.464q3.648-1.856 11.616-5.088a174.592 174.592 0 0 0 18.912-10.4c3.712-2.08 8.448-6.656 12.8-9.6a44.8 44.8 0 0 0 5.12-3.84 125.024 125.024 0 0 0 22.816-25.344 17.088 17.088 0 0 1 1.792-2.464 25.376 25.376 0 0 0 5.088-7.008 22.048 22.048 0 0 1 4.096-6.08 1.824 1.824 0 0 0 0.32-0.448l9.6-18.88a5.312 5.312 0 0 0 0.48-1.472l0.512-2.944a8 8 0 0 1 0.576-1.888 86.976 86.976 0 0 0 5.344-15.008q2.016-9.152 3.008-14.56a136 136 0 0 0 1.952-23.68v-270.016a8.352 8.352 0 0 1 1.312-4.704 0.896 0.896 0 0 1 0.576-0.384 0.896 0.896 0 0 1 0.672 0.16 18.592 18.592 0 0 0 7.296 3.488q3.552 0.8 6.08 1.6c9.088 2.944 18.368 5.28 26.56 8.192a18.4 18.4 0 0 0 3.2 0.864c4.064 0.672 7.328 3.008 10.72 3.488s6.88 3.008 10.624 3.52 6.048 2.72 9.6 3.2a27.264 27.264 0 0 1 4.8 1.248q5.888 2.08 14.656 4.384a20.544 20.544 0 0 1 3.456 1.248 39.68 39.68 0 0 0 9.6 3.744 24.576 24.576 0 0 1 8.736 3.872q6.976 5.056 8.704 5.952a7.264 7.264 0 0 1 1.6 1.12 106.144 106.144 0 0 1 9.92 8.96 107.264 107.264 0 0 1 10.784 13.504q1.536 2.56 4.896 7.2a17.952 17.952 0 0 1 2.56 5.152 124.8 124.8 0 0 1 5.152 16.928c0.48 3.68 1.888 7.168 2.176 11.328a107.744 107.744 0 0 1-0.672 20.288 54.4 54.4 0 0 1-1.696 8.832 101.408 101.408 0 0 1-4.544 15.52c-1.472 3.008-1.344 6.08-2.976 9.152s-1.888 7.36-3.584 10.816a15.456 15.456 0 0 0-1.696 4.96c-0.416 3.552-2.752 6.624-3.2 10.208s-3.2 7.04-3.648 10.656-2.944 6.656-3.424 10.56-3.2 7.04-3.584 11.36a3.2 3.2 0 0 1-0.256 1.056l-2.528 5.696a5.984 5.984 0 0 0-0.448 1.632 23.168 23.168 0 0 1-2.752 8.064c-0.896 1.632-0.864 5.088-1.984 7.296a21.216 21.216 0 0 0-2.144 6.08c-0.544 3.744-3.2 7.2-3.616 10.432-0.384 3.84-2.784 6.72-3.392 10.56a16.608 16.608 0 0 1-1.632 5.024 26.368 26.368 0 0 0-2.272 7.136 6.592 6.592 0 0 1-0.384 1.312l-2.24 5.184a4.64 4.64 0 0 0-0.32 1.024 23.072 23.072 0 0 1-1.6 5.792 19.808 19.808 0 0 0-1.792 5.024q0 0.864-3.2 10.4a56.864 56.864 0 0 1-2.016 5.728c-1.088 2.432-1.472 4.8-2.496 7.712q-3.2 8.64-5.856 17.344-2.208 6.944-8.384 25.088-4.64 13.664-9.216 27.424-4.896 14.688-11.264 34.4-1.824 5.696-2.752 8.896-1.888 6.656-2.656 8.896l-27.392 82.496a56.672 56.672 0 0 1-3.968 8.96 4.352 4.352 0 0 0-0.48 1.44 46.016 46.016 0 0 1-7.776 16 38.4 38.4 0 0 1-4.448 5.824 139.104 139.104 0 0 1-16.512 16.736 8.544 8.544 0 0 1-1.728 1.088 66.912 66.912 0 0 0-10.88 6.944l-0.512 0.32-2.592 1.312a13.92 13.92 0 0 1-2.272 0.896 66.976 66.976 0 0 0-10.656 4.064 7.84 7.84 0 0 1-2.24 0.704c-5.152 0.768-9.44 2.016-14.752 2.336-2.592 0-5.216 0.256-7.776 0.256a86.4 86.4 0 0 1-21.824-2.496zM599.872 691.2l-413.664-0.8A90.368 90.368 0 0 1 96 599.904l0.736-413.696A90.368 90.368 0 0 1 187.232 96l413.664 0.736A90.368 90.368 0 0 1 691.2 187.232l-0.736 413.696A90.368 90.368 0 0 1 600 691.2zM185.6 186.752v324.448a1.152 1.152 0 0 0 1.152 1.152h413.664a1.152 1.152 0 0 0 1.152-1.152V186.752a1.152 1.152 0 0 0-1.152-1.152H186.816a1.152 1.152 0 0 0-1.216 1.152z"></path>
          </svg>
        </span>
      </router-link>
    </div>

    <div class="sidebar-footer">
      <!-- <div :class="['sidebar-footer-item', { 'sidebar-footer-item-closed': !isOpen }]">
        <span v-if="isOpen" class="sidebar-copyright">Copyright 2025 CDUT All Rights Reserved.</span>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { h, ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import learningPathIcon from '../../assets/fonts/学习路径.png'
import homeIcon from '../../assets/首页.png'

// 状态管理
const showMenu = ref(false)
const menuPosition = ref(null)
const currentMenuSessionId = ref(null)
const showRenameDialog = ref(false)
const renameValue = ref('')
const renameInputRef = ref(null)
const isBatchMode = ref(false)
const selectedSessions = ref(new Set())

const router = useRouter()

// 使用简单的 SVG 图标组件
const MenuIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('line', { x1: 3, y1: 6, x2: 21, y2: 6 }),
  h('line', { x1: 3, y1: 12, x2: 21, y2: 12 }),
  h('line', { x1: 3, y1: 18, x2: 21, y2: 18 })
])

const PlusIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
  h('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
])

const MessageSquareIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
])

const HistoryIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('polyline', { points: '12 6 12 12 16 14' })
])

const GemIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M6 3h12l4 6-10 12L2 9z' })
])

const PinIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 12, y1: 17, x2: 12, y2: 22 }),
  h('path', { d: 'M5 17h14l-1-7H6z' }),
  h('path', { d: 'M9 10V4h6v6' })
])

const SettingsIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
  h('circle', { cx: 12, cy: 12, r: 3 }),
  h('path', { d: 'M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24' })
])

const MoreVerticalIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 1 }),
  h('circle', { cx: 12, cy: 5, r: 1 }),
  h('circle', { cx: 12, cy: 19, r: 1 })
])

const ClockIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 12, cy: 12, r: 10 }),
  h('polyline', { points: '12 6 12 12 16 14' })
])

const PinMenuIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 12, y1: 17, x2: 12, y2: 22 }),
  h('path', { d: 'M5 17h14l-1-7H6z' }),
  h('path', { d: 'M9 10V4h6v6' })
])

const PencilIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
  h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
])

const TrashIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '3 6 5 6 21 6' }),
  h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
])

const LayersIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polygon', { points: '12 2 2 7 12 12 22 7 12 2' }),
  h('polyline', { points: '2 17 12 22 22 17' }),
  h('polyline', { points: '2 12 12 17 22 12' })
])

const CheckSquareIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '9 11 12 14 22 4' }),
  h('path', { d: 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' })
])

const SquareIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 })
])

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  toggleOpen: {
    type: Function,
    required: true
  },
  sessions: {
    type: Array,
    required: true
  },
  currentSessionId: {
    type: String,
    default: null
  },
  onNewChat: {
    type: Function,
    required: true
  },
  onNewStudyPathChat: {
    type: Function,
    default: null
  },
  scene: {
    type: String,
    default: 'default'
  },
  onSelectSession: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['updateSession', 'deleteSession', 'deleteSessions'])

const goHome = () => {
  router.push('/home')
}

const handleLearningPathClick = () => {
  if (typeof props.onNewStudyPathChat === 'function') {
    props.onNewStudyPathChat()
  } else if (typeof props.onNewChat === 'function') {
    props.onNewChat()
  }
}

// 计算属性：排序后的会话列表（置顶的在前）
const sortedSessions = computed(() => {
  return [...props.sessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })
})

// 学习路径对话：根据标题前缀识别（例如 “学习路径：Java 入门”）
const isLearningPathSession = (session) => {
  const title = (session && session.title) || ''
  return typeof title === 'string' && title.trim().startsWith('学习路径')
}

// 打开菜单
const openMenu = (sessionId, event) => {
  currentMenuSessionId.value = sessionId
  const rect = event.target.closest('.sidebar-chat-item').getBoundingClientRect()
  const sidebarRect = event.target.closest('.sidebar').getBoundingClientRect()
  menuPosition.value = {
    top: rect.bottom - sidebarRect.top + 4,
    left: rect.left - sidebarRect.left + rect.width - 120
  }
  showMenu.value = true
}

// 关闭菜单
const closeMenu = () => {
  showMenu.value = false
  menuPosition.value = null
  currentMenuSessionId.value = null
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (showMenu.value && !event.target.closest('.sidebar-menu')) {
    closeMenu()
  }
}

// 置顶
const handlePin = () => {
  const session = props.sessions.find(s => s.id === currentMenuSessionId.value)
  if (session) {
    emit('updateSession', {
      ...session,
      isPinned: !session.isPinned
    })
  }
  closeMenu()
}

// 重命名
const handleRename = () => {
  const session = props.sessions.find(s => s.id === currentMenuSessionId.value)
  if (session) {
    renameValue.value = session.title
    showRenameDialog.value = true
    nextTick(() => {
      if (renameInputRef.value) {
        renameInputRef.value.focus()
        renameInputRef.value.select()
      }
    })
  }
  closeMenu()
}

// 确认重命名
const confirmRename = () => {
  if (renameValue.value.trim()) {
    const session = props.sessions.find(s => s.id === currentMenuSessionId.value)
    if (session) {
      emit('updateSession', {
        ...session,
        title: renameValue.value.trim()
      })
    }
  }
  closeRenameDialog()
}

// 关闭重命名对话框
const closeRenameDialog = () => {
  showRenameDialog.value = false
  renameValue.value = ''
}

// 删除
const handleDelete = () => {
  emit('deleteSession', currentMenuSessionId.value)
  closeMenu()
}

// 批量操作
const handleBatchOperation = () => {
  isBatchMode.value = true
  selectedSessions.value.clear()
  closeMenu()
}

// 退出批量操作模式
const exitBatchMode = () => {
  isBatchMode.value = false
  selectedSessions.value.clear()
}

// 切换选择
const toggleSelect = (sessionId) => {
  if (selectedSessions.value.has(sessionId)) {
    selectedSessions.value.delete(sessionId)
  } else {
    selectedSessions.value.add(sessionId)
  }
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedSessions.value.size === props.sessions.length) {
    selectedSessions.value.clear()
  } else {
    selectedSessions.value = new Set(props.sessions.map(s => s.id))
  }
}

// 删除选中的会话
const deleteSelected = () => {
  if (selectedSessions.value.size > 0) {
    emit('deleteSessions', Array.from(selectedSessions.value))
    exitBatchMode()
  }
}

// 处理列表项点击
const handleItemClick = (sessionId) => {
  if (isBatchMode.value) {
    toggleSelect(sessionId)
  } else {
    props.onSelectSession(sessionId)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f0f4f9;
  transition: width 0.3s;
  width: 280px;
}

.sidebar-closed {
  width: 68px;
}

.sidebar-header {
  padding: 16px 16px 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-toggle,
.sidebar-search {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-home-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  transition: transform 0.16s ease, filter 0.16s ease;
}

.sidebar-toggle:hover,
.sidebar-search:hover {
  background: #e1e5ea;
}

.sidebar-search:hover .sidebar-home-icon {
  transform: translateY(-1px) scale(1.06);
  filter: drop-shadow(0 2px 4px rgba(124, 58, 237, 0.18));
}

.sidebar-new-chat {
  padding: 12px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #dde3ea;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 12px 16px;
  width: 100%;
}

.new-chat-btn-closed {
  width: 40px;
  height: 40px;
  justify-content: center;
  padding: 0;
  margin-left: 2px;
}

.new-chat-btn:hover {
  background: #d3d9e0;
}

.learning-path-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.learning-path-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 14px;
  cursor: pointer;
  /* color: #1a73e8; */
  font-size: 15px;
  /* border-radius: 9999px;
  background: #e8f0fe; */
}

.learning-path-row:hover {
  background: rgba(147, 51, 234, 0.08);
  border-radius: 12px;
}

.learning-path-svg-icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.learning-path-svg-icon svg {
  width: 20px;
  height: 20px;
  display: block;
}

/* .learning-path-text {
  font-weight: 600;
} */

.learning-path-row:hover .learning-path-text {
  text-decoration: none;
}

.learning-path-row-active {
  background: rgba(147, 51, 234, 0.12);
  border-radius: 12px;
}

.learning-path-link {
  text-decoration: none;
  color: #6b7280;
  margin-top: 2px;
}

.learning-path-link:hover {
  color: #9333ea;
}

.learning-path-link-text {
  font-size: 14px;
}

.sidebar-section-divider {
  margin: 4px 12px 6px;
  border-bottom: 1px solid #a2a3a3;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.sidebar-section-header:hover {
  background: #e1e5ea;
}

.sidebar-section-header h3 {
  margin: 0;
  padding: 0;
  font-size: 14px;
  font-weight: 500;
  color: #444746;
}

.sidebar-arrow {
  font-size: 12px;
  opacity: 0.6;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  font-size: 14px;
  color: #444746;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.sidebar-item:hover {
  background: #e1e5ea;
}

.sidebar-section-title {
  padding: 0;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #444746;
}

.sidebar-chats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.sidebar-chat-item:hover {
  background: #e1e5ea;
}

.sidebar-chat-item.active {
  background: #d3e3fd;
}

.sidebar-chat-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-chat-session-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-pin {
  opacity: 0.6;
  flex-shrink: 0;
}

.sidebar-chat-more {
  opacity: 0;
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar-chat-item:hover .sidebar-chat-more {
  opacity: 1;
}

.sidebar-chat-more:hover {
  background: rgba(0, 0, 0, 0.05);
}

.sidebar-icons-closed {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.sidebar-icon-btn {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-decoration: none;
}

.sidebar-icon-learning-path {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.sidebar-icon-btn:hover {
  background: #e1e5ea;
}

.sidebar-footer {
  margin-top: auto;
  border-top: 1px solid #e1e5ea;
  padding: 12px;
}

.sidebar-footer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-footer-item-closed {
  justify-content: center;
}

.sidebar-footer-item:hover {
  background: #e1e5ea;
}

.sidebar-copyright {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.4;
  cursor: default;
}

/* 自定义滚动条 */
.sidebar-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #d3d9e0;
  border-radius: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #c2c8d0;
}


.sidebar-refresh-btn {
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s;
}

.sidebar-refresh-btn:hover {
  opacity: 1;
  background: #e1e5ea;
}

.sidebar-chat-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
}

.sidebar-chat-item.selected {
  background: #e1e5ea;
}

.sidebar-batch-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
}

.sidebar-batch-select-all {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.sidebar-batch-select-all:hover {
  background: #1557b0;
}

.sidebar-batch-count {
  flex: 1;
  font-size: 13px;
  color: #5e5e5e;
}

.sidebar-batch-cancel {
  padding: 4px 12px;
  background: white;
  border: 1px solid #e1e5ea;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #444746;
  transition: background-color 0.2s;
}

.sidebar-batch-cancel:hover {
  background: #f0f4f9;
}

.sidebar-batch-delete {
  padding: 4px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.sidebar-batch-delete:hover {
  background: #c82333;
}

.sidebar-menu {
  position: absolute;
  background: white;
  border: 1px solid #e1e5ea;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 140px;
  overflow: hidden;
}

.sidebar-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #444746;
  transition: background-color 0.2s;
}

.sidebar-menu-item:hover {
  background: #f0f4f9;
}

.sidebar-menu-item:last-child {
  border-top: 1px solid #e1e5ea;
}

.sidebar-rename-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.sidebar-rename-dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.sidebar-rename-dialog h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.sidebar-rename-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e1e5ea;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.sidebar-rename-input:focus {
  border-color: #1a73e8;
}

.sidebar-rename-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.sidebar-rename-cancel,
.sidebar-rename-confirm {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-rename-cancel {
  background: white;
  border: 1px solid #e1e5ea;
  color: #444746;
}

.sidebar-rename-cancel:hover {
  background: #f0f4f9;
}

.sidebar-rename-confirm {
  background: #1a73e8;
  color: white;
  border: none;
}

.sidebar-rename-confirm:hover {
  background: #1557b0;
}
</style>
