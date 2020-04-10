export interface IList {
  //idは途中で変更しないので,readonly修飾子を付ける(値を変更するとエラー)
  // 数値なのでnumber型
  readonly id: number;
  name: string;
  cards: ICard[];
}

export interface ICard {
  readonly id: number;
  text: string;
}
