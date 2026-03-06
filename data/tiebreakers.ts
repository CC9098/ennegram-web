import { results } from "@/data/results";
import { EnneagramType } from "@/data/questions";

type PromptKey =
  | "pressure"
  | "stability"
  | "priority"
  | "relationships"
  | "imbalance";

interface TypeProfile {
  pressure: string;
  stability: string;
  priority: string;
  relationships: string;
  imbalance: string;
}

interface PromptTemplate {
  id: PromptKey;
  prompt: string;
}

export interface TieBreakerOption {
  type: EnneagramType;
  text: string;
}

export interface TieBreakerQuestion {
  id: string;
  prompt: string;
  a: TieBreakerOption;
  b: TieBreakerOption;
}

const typeProfiles: Record<EnneagramType, TypeProfile> = {
  1: {
    pressure: "事情出錯、標準被放低，或者自己做得不夠好。",
    stability: "收緊自己，糾正問題，讓一切回到正軌。",
    priority: "做對、做好，對得住原則與良心。",
    relationships: "指出應該改進的地方，希望事情更完善。",
    imbalance: "對自己和別人要求過高，難以放鬆。",
  },
  2: {
    pressure: "自己不再被需要，付出好像沒有價值。",
    stability: "主動付出與照顧，透過連結找回存在感。",
    priority: "被重視、被需要，感受到自己對人有幫助。",
    relationships: "先照顧對方感受，容易把自己擺後。",
    imbalance: "用付出換取認同，忽略自己真正需要。",
  },
  3: {
    pressure: "自己失敗、停滯，或者被視為沒有價值。",
    stability: "切回目標模式，把事情做成、把形象站穩。",
    priority: "有效率、有成果，能被看見和肯定。",
    relationships: "用表現和成果證明自己值得信任。",
    imbalance: "把感受壓後，只顧追結果與形象。",
  },
  4: {
    pressure: "自己變得平凡、失真，沒被真正理解。",
    stability: "深入感受情緒，找回意義和真實感。",
    priority: "活得真實，有深度，保留獨特自我。",
    relationships: "追求深刻連結，也容易感到距離與落差。",
    imbalance: "沉浸在失落、比較或自我拉扯之中。",
  },
  5: {
    pressure: "自己被耗盡、被打擾，沒有足夠資源應付。",
    stability: "先退後觀察，理解清楚再投入。",
    priority: "保留空間與自主，掌握知識和邏輯。",
    relationships: "保持邊界與距離，先確保自己不被耗空。",
    imbalance: "抽離過頭，變得過度冷靜或封閉。",
  },
  6: {
    pressure: "失去支持、安全感不足，風險沒被掌握。",
    stability: "先想清風險和備案，確認誰值得信任。",
    priority: "可靠、安全、可預測，站穩才安心。",
    relationships: "反覆確認彼此是否可靠，會先測試再信任。",
    imbalance: "懷疑、擔心、反覆驗證，難以放鬆。",
  },
  7: {
    pressure: "被困住、選擇變少，陷在沉悶或痛苦裡。",
    stability: "打開新選項，轉向更有可能性和空間的方向。",
    priority: "自由、可能性、快樂與新鮮感。",
    relationships: "帶來氣氛和點子，不想被沉重感困住。",
    imbalance: "逃開不舒服，停不下來，什麼都想抓住。",
  },
  8: {
    pressure: "被控制、被侵犯，或者顯得太脆弱。",
    stability: "正面迎上，奪回主導權，自己扛起來。",
    priority: "掌控感、力量、直接與自主。",
    relationships: "直接表態、保護自己人，不想被人壓住。",
    imbalance: "太強硬、太衝，忽略自己的柔軟面。",
  },
  9: {
    pressure: "關係失和、衝突升高，內心再也不平靜。",
    stability: "先緩和氣氛，讓局面回到平和穩定。",
    priority: "平靜、和諧、安穩，不被拉進劇烈對立。",
    relationships: "包容配合，希望大家舒服、少衝突。",
    imbalance: "淡化自己需求，拖住不表態，越來越麻木。",
  },
};

const promptTemplates: PromptTemplate[] = [
  {
    id: "pressure",
    prompt: "當壓力上來時，哪種不舒服更貼近你？",
  },
  {
    id: "stability",
    prompt: "你更自然用哪種方式令自己重新穩定？",
  },
  {
    id: "priority",
    prompt: "如果只能揀一樣，哪件事對你更重要？",
  },
  {
    id: "relationships",
    prompt: "在關係或合作裡，你更常見自己是哪一種？",
  },
  {
    id: "imbalance",
    prompt: "當自己失衡時，你更容易跌入哪種狀態？",
  },
];

export function buildTieBreakerQuestions(
  firstType: EnneagramType,
  secondType: EnneagramType
): TieBreakerQuestion[] {
  return promptTemplates.map((template, index) => {
    const swapSides = index % 2 === 1;
    const leftType = swapSides ? secondType : firstType;
    const rightType = swapSides ? firstType : secondType;

    return {
      id: `${firstType}-${secondType}-${template.id}`,
      prompt: template.prompt,
      a: {
        type: leftType,
        text: typeProfiles[leftType][template.id],
      },
      b: {
        type: rightType,
        text: typeProfiles[rightType][template.id],
      },
    };
  });
}

export function getTieBreakerTitle(firstType: EnneagramType, secondType: EnneagramType) {
  return `${results[firstType].name} vs ${results[secondType].name}`;
}
