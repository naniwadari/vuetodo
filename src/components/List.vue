<template>
  <div class="list">
    {{ list.name }}
    <!-- JSの式を二重中括弧で囲うとテキスト展開される(マスタタッシュ構文)-->
    <Card v-for="card in list.cards" :key="card.id" :card="card" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Card from "../components/Card.vue";
import { IList } from "../types";

@Component({
  components: {
    Card,
  },
})
export default class List extends Vue {
  @Prop({ type: Object, required: true })
  list!: IList;
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
