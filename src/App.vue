<template>
  <div id="app">
    <template v-for="list in lists">
      <div class="list-container" :key="list.id">
        <List :list="list" />
      </div>
    </template>
    <input type="text" @change="addList" />
    <List v-for="list in lists" :key="list.id" :list="list" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import List from "./components/List.vue";
import { IList } from "./types";
import { createInitialLists } from "./initialData";

@Component({
  components: {
    List,
  },
})
export default class App extends Vue {
  lists: IList[] = createInitialLists();
  listCreatedCount = 2;

  addList(event: Event & { currentTarget: HTMLInputElement }): void {
    const newList = {
      id: this.listCreatedCount + 1,
      name: event.currentTarget.value,
      cards: [],
    };
    this.lists.push(newList);
    //listsに追加されたため、listCreatedCountをインクリメント
    ++this.listCreatedCount;
    //フォームの値をリセットするために空文字を代入
    event.currentTarget.value = "";
  }
}
</script>

<style lang="scss">
#app {
  display: flex;
  > .list {
    margin: 1px;
  }
}
</style>
