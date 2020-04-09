<template>
  <div id="app">
    <List
      v-for="list in lists"
      :key="list.id"
      class="list"
      :list="list"
      :listName.sync="list.name"
      @add-card="addCard"
    />
    <input type="text" class="list-input" @change="addList" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import List from "./components/List.vue";
import { IList } from "./types";
import { createInitialLists } from "./initialData";
import { IAddCardEvent } from "./components/List.vue";

@Component({
  components: {
    List,
  },
})
export default class App extends Vue {
  lists: IList[] = createInitialLists();
  //id用
  listCreatedCount = createInitialLists().length; //リストの数を初期値に
  //addListには引数を与えられないので第一引数にイベントオブジェクトが渡される。
  //イベントオブジェクトの型定義についてはTypeScriptの型定義を参照のこと
  //今回のEvent型はtsconfig.jsonでグローバルに登録されているのでimportせずに使える
  //currentTargetプロパティのvalueプロパティが目当てのフォームの入力の値だが
  //Event型にはcurrentTargetプロパティがないので、currentTarget:HTMLInputElementで追加している
  //あるオブジェクトの方にプロパティを追加するには、 プロパティを持つオブジェクト型を&を使ってつなげる
  //このような型をintersection型という
  cardCreatedCount = 4;
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

  addCard({ listId, text }: IAddCardEvent): void {
    const list = this.lists.find((list) => list.id === listId);
    /*findは見つからなかった場合undefinedを返す可能性があるので、その場合は早期リターンする
    ここではlist: IList | undefined */
    if (list === undefined) return;
    const newCard = {
      id: this.cardCreatedCount + 1,
      text,
    };
    //ここではlist:IList
    list.cards.push(newCard);
    ++this.cardCreatedCount;
  }
}
</script>

<style lang="scss">
#app {
  display: flex;
  align-items: flex-start;
  > .list {
    margin: 1px;
  }

  > .list-input {
    width: 160px;
    margin: 1px;
  }
}
</style>
