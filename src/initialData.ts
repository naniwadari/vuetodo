import { IList } from "@/types";

export function createInitialLists(): IList[] {
  return [
    {
      id: 1,
      name: "リスト１",
      cards: [
        {
          id: 1,
          text: "タスク１",
        },
        {
          id: 2,
          text: "タスク2",
        },
      ],
    },
    {
      id: 2,
      name: "リスト２",
      cards: [
        {
          id: 3,
          text: "タスク3",
        },
        {
          id: 4,
          text: "タスク４",
        },
      ],
    },
  ];
}
