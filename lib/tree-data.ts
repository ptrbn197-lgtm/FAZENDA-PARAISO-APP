import type { WorkerTreeInventory } from "./types"

export const TREE_INVENTORY_DATA: WorkerTreeInventory[] = [
  {
    id: "worker-3",
    workerName: "Aquiles",
    code: "A",
    sections: [
      { section: "A1", treeCount: 805 },
      { section: "A2", treeCount: 1042 },
      { section: "A3", treeCount: 898 },
      { section: "A4", treeCount: 911 },
    ],
    totalTrees: 3656,
  },
  {
    id: "worker-6",
    workerName: "Messias",
    code: "B",
    sections: [
      { section: "B1", treeCount: 986 },
      { section: "B2", treeCount: 775 },
      { section: "B3", treeCount: 663 },
      { section: "B4", treeCount: 766 },
    ],
    totalTrees: 3190,
  },
  {
    id: "worker-7",
    workerName: "Zuzueli",
    code: "C",
    sections: [
      { section: "C1", treeCount: 959 },
      { section: "C2", treeCount: 770 },
      { section: "C3", treeCount: 1158 },
      { section: "C4", treeCount: 1341 },
    ],
    totalTrees: 4228,
  },
  {
    id: "worker-1",
    workerName: "Anderson",
    code: "D",
    sections: [
      { section: "D1", treeCount: 973 },
      { section: "D2", treeCount: 761 },
      { section: "D3", treeCount: 874 },
      { section: "D4", treeCount: 1221 },
    ],
    totalTrees: 3829,
  },
  {
    id: "worker-4",
    workerName: "Patrick",
    code: "E",
    sections: [
      { section: "E1", treeCount: 831 },
      { section: "E2", treeCount: 996 },
      { section: "E3", treeCount: 996 },
      { section: "E4", treeCount: 1130 },
    ],
    totalTrees: 3953,
  },
  {
    id: "worker-2",
    workerName: "Valdeci",
    code: "F",
    sections: [
      { section: "F1", treeCount: 1102 },
      { section: "F2", treeCount: 1095 },
      { section: "F3", treeCount: 1039 },
      { section: "F4", treeCount: 1057 },
    ],
    totalTrees: 4293,
  },
  {
    id: "worker-5",
    workerName: "Fabio",
    code: "G",
    sections: [
      { section: "G1", treeCount: 730 },
      { section: "G2", treeCount: 1125 },
      { section: "G3", treeCount: 1218 },
      { section: "G4", treeCount: 511 },
    ],
    totalTrees: 3584,
  },
]

export const ADDITIONAL_EXTRA_TREES_01 = 854
export const ADDITIONAL_EXTRA_TREES_02 = 530

// Calculate grand total
export const GRAND_TOTAL_TREES = TREE_INVENTORY_DATA.reduce(
  (acc, worker) => acc + worker.totalTrees,
  ADDITIONAL_EXTRA_TREES_01 + ADDITIONAL_EXTRA_TREES_02,
)

export function getWorkerInventory(): WorkerTreeInventory[] {
  return TREE_INVENTORY_DATA
}
