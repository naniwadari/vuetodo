<template>
  <div class="list">
    <div
      :contenteditable="contenteditable"
      @dblclick="onDoubleClick"
      @keypress.enter="onKeyPressEnter"
      @blur="onBlur"
    >
      {{ list.name }}
    </div>
    <!-- JSの式を二重中括弧で囲うとテキスト展開される(マスタタッシュ構文)-->
    <Card
      v-for="card in list.cards"
      :key="card.id"
      class="card"
      :card="card"
      :cardText.sync="card.text"
    />
    <input type="text" @change="addCard" />
  </div>
</template>

<script lang="ts">
export interface IAddCardEvent {
  listId: number;
  text: string;
}
import { Component, Vue, Prop, Emit, PropSync } from "vue-property-decorator";
import Card from "../components/Card.vue";
import { IList } from "../types";

@Component({
  components: {
    Card,
  },
})
export default class List extends Vue {
  @Prop({ type: Object, required: true })
  readonly list!: IList;

  @PropSync("listName", { type: String, required: true })
  syncedListName!: IList["name"];
  //content editable
  contenteditable = false;

  @Emit()
  addCard(event: Event & { currentTarget: HTMLInputElement }): IAddCardEvent {
    //次の処理でリセットしてしまうので変数に格納
    const text = event.currentTarget.value;
    //フォームの値をリセット
    event.currentTarget.value = "";
    //返す内容が複数あるのでオブジェクトで返す
    return {
      listId: this.list.id,
      text,
    };
  }

  onDoubleClick(event: MouseEvent & { currentTarget: HTMLDivElement }): void {
    //要素のテキストを編集可能にする
    this.contenteditable = true;
    //要素にフォーカスを当てる
    event.currentTarget.focus();
  }

  onKeyPressEnter(
    event: KeyboardEvent & { currentTarget: HTMLDivElement }
  ): void {
    //要素からフォーカスを外す
    event.currentTarget.blur();
  }
  onBlur(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
    this.syncedListName = event.currentTarget.innerText;
    //要素のテキストを編集不可にする
    this.contenteditable = false;
  }
}
</script>
<style lang="scss" scoped>
.list {
  border: 1px solid #000000;
  > .card {
    margin: 1px;
  }
}
</style>
