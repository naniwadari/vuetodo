<template>
  <div>
    {{ list.name }}
    <!-- JSの式を二重中括弧で囲うとテキスト展開される(マスタタッシュ構文)-->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { IList } from "@/types";

@Component
export default class List extends Vue {
  @Prop({ type: Object, required: true })
  list!: IList;
}
</script>