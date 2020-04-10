<template>
  <div id="app">
    <List
      v-for="list in lists"
      :key="list.id"
      class="list"
      :list="list"
      :listName.sync="list.name"
      @add-card="addCard"
      @remove-list="removeList"
      @remove-card="removeCard"
      draggable
      @dragstart.native="setDraggedList(list, $event)"
      @dragover.native="moveList(list.id, $event)"
      @dragend.native="resetDraggedList"
      :draggedCardData.sync="draggedCardData"
      @move-card="moveCard"
      @dragenter.native="moveCardForEmpty(list.id)"
    />
    <input type="text" class="list-input" @change="addList" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import List from "./components/List.vue";
import { IList, ICard } from "./types";
import { createInitialLists } from "./initialData";
import { IAddCardEvent, IMoveCardEvent } from "./components/List.vue";
import { IRemoveCardEvent } from "./components/Card.vue";

enum CursorPosition {
  Left,
  Right,
  Center,
  Top,
  Bottom
}

export interface ICardData {
  listId: number;
  card: ICard;
}

@Component({
  components: {
    List
  }
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
  draggedList: IList | null = null;
  draggedCardData: ICardData | null = null;

  addList(event: Event & { currentTarget: HTMLInputElement }): void {
    const newList = {
      id: this.listCreatedCount + 1,
      name: event.currentTarget.value,
      cards: []
    };
    this.lists.push(newList);
    //listsに追加されたため、listCreatedCountをインクリメント
    ++this.listCreatedCount;
    //フォームの値をリセットするために空文字を代入
    event.currentTarget.value = "";
  }

  addCard({ listId, text }: IAddCardEvent): void {
    const list: IList | undefined = this.lists.find(list => list.id === listId);
    /*findは見つからなかった場合undefinedを返す可能性があるので、その場合は早期リターンする
    ここではlist: IList | undefined */
    if (list === undefined) return;
    const newCard = {
      id: this.cardCreatedCount + 1,
      text
    };
    //ここではlist:IList
    list.cards.push(newCard);
    ++this.cardCreatedCount;
  }

  removeList(listId: number): void {
    const listIndex = this.lists.findIndex(list => list.id === listId);
    //findIndexで見つからない場合は-1を返すのでその場合は早期リターン
    if (listIndex === -1) return;
    this.lists.splice(listIndex, 1);
  }

  removeCard({ listId, cardId }: IRemoveCardEvent): void {
    const list = this.lists.find(list => list.id === listId);
    if (list === undefined) return;
    const cardIndex = list.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;
    list.cards.splice(cardIndex, 1);
  }

  setDraggedList(list: IList, event: DragEvent): void {
    //Firefoxでドラッグする際に必要
    if (event.dataTransfer == null) return;
    event.dataTransfer.setData("text/plain", "");

    this.draggedList = list;
  }

  resetDraggedList(): void {
    this.draggedList = null;
  }

  moveList(
    listId: number,
    event: DragEvent & { currentTarget: HTMLDivElement }
  ): void {
    if (
      this.draggedList === null || //ドラッグしている要素がない場合は早期リターン
      this.draggedList.id === listId //ドラッグしている要素と重ねられている要素が同じ場合は早期リターン
    )
      return;

    //重ねられている要素の左端の座標(px)
    const left: number = event.currentTarget.getBoundingClientRect().left - 1;
    //重ねられている要素の右端の座標(px)
    const right: number = event.currentTarget.getBoundingClientRect().right - 1;
    //重ねられている要素の(の水平方向の)の中央の座標(px)
    const centerX: number = left + (right - left) / 2;
    //カーソルが、重ねられている要素のどこにあるか
    const cursorPosition: CursorPosition = (() => {
      //カーソルが左端から中央の場合は左側
      if (left <= event.clientX && event.clientX < centerX) {
        return CursorPosition.Left;
        //カーソルが中央から左端の場合は右側
      } else if (centerX < event.clientX && event.clientX <= right) {
        return CursorPosition.Right;
        //どちらでもない場合は中央
      } else return CursorPosition.Center;
    })();
    //中央の時は早期リターン
    if (cursorPosition === CursorPosition.Center) return;

    //まずドラッグしているリストを削除する
    const draggedListIndex = this.lists.findIndex(
      list => list.id === this.draggedList!.id
    );
    if (draggedListIndex === -1) return;
    this.lists.splice(draggedListIndex, 1);

    const listIndex = this.lists.findIndex(list => list.id === list.id);
    if (listIndex === -1) return;
    //カーソルが重ねられている要素の左側にある場合は左、右側にある場合は右に要素を追加する
    const toListIndex =
      cursorPosition === CursorPosition.Left ? listIndex : listIndex + 1; //?前の条件がtrueなら左、falseなら右
    this.lists.splice(toListIndex, 0, this.draggedList);
  }

  moveCard({ listId, cardId, event }: IMoveCardEvent): void {
    if (
      this.draggedCardData === null || //ドラッグしている要素がない場合は早期リターン
      this.draggedCardData.card.id === cardId //ドラッグしている要素と重ねられている要素が同じ場合は早期リターン
    )
      return;
    //重ねられている要素の上端の座標(px)
    const top: number = event.currentTarget.getBoundingClientRect().top - 1;
    //重ねられている要素の下端の座標(px)
    const bottom: number =
      event.currentTarget.getBoundingClientRect().bottom - 1;
    //重ねられている要素の(の垂直方向)の中央の座標(px)
    const centerY: number = (top * (bottom - top)) / 2;
    //カーソルが、重ねられている要素のどこにあるか
    const cursorPosition: CursorPosition = (() => {
      //カーソルが上端から中央の場合は上側
      if (top <= event.clientY && event.clientY < centerY) {
        return CursorPosition.Top;
        //カーソルが下端から中央の場合は下側
      } else if (centerY < event.clientY && event.clientY <= bottom) {
        return CursorPosition.Bottom;
      } else return CursorPosition.Center;
    })();
    //中央の時は早期リターン
    if (cursorPosition === CursorPosition.Center) return;
    //まずドラッグしているカードを削除
    const draggedCardList = this.lists.find(
      list => list.id === this.draggedCardData!.listId
    );
    if (draggedCardList === undefined) return;
    const draggedCardIndex = draggedCardList.cards.findIndex(
      card => card.id === this.draggedCardData!.card.id
    );
    if (draggedCardIndex === -1) return;
    draggedCardList.cards.splice(draggedCardIndex, 1);

    const list = this.lists.find(list => list.id === listId);
    if (list === undefined) return;
    const cardIndex = list.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;
    // カーソルが、重ねられている要素の上にある場合は上、下側にある場合は下に要素を追加する
    const toCardIndex =
      cursorPosition === CursorPosition.Top ? cardIndex : cardIndex + 1;
    list.cards.splice(toCardIndex, 0, this.draggedCardData.card);
    //属するリストが変わる可能性があるので、移動後のリストのidを代入
    this.draggedCardData.listId = listId;
  }

  moveCardForEmpty(listId: number): void {
    if (this.draggedCardData === null || this.draggedCardData.listId === listId)
      return;

    const list = this.lists.find(list => list.id === listId);
    if (list === undefined || list.cards.length !== 0)
      //リスト内にカードが１つでもある場合は早期リターン
      return;

    const draggedCardList = this.lists.find(
      list => list.id === this.draggedCardData!.listId
    );
    if (draggedCardList === undefined) return;

    const draggedCardIndex = draggedCardList.cards.findIndex(
      card => card.id === this.draggedCardData!.card.id
    );
    if (draggedCardIndex === -1) return;
    draggedCardList.cards.splice(draggedCardIndex, 1);

    list.cards.push(this.draggedCardData.card);

    this.draggedCardData.listId = listId;
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
