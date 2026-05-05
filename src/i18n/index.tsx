import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "zh-TW" | "zh-CN" | "en" | "ja" | "ko";

export const LANGS: { v: Lang; l: string }[] = [
  { v: "zh-TW", l: "繁體中文" },
  { v: "zh-CN", l: "简体中文" },
  { v: "en", l: "English" },
  { v: "ja", l: "日本語" },
  { v: "ko", l: "한국어" },
];

type Dict = Record<string, string>;

const dict: Record<Lang, Dict> = {
  "zh-TW": {
    menu: "選單", account: "帳號", settings: "設定", logout: "登出",
    dex: "圖鑑", teamShare: "隊伍分享", reportIssue: "回報問題", shareApp: "分享這個 APP",
    idName: "ID Name", email: "Email", linkedAccounts: "連動帳號", notLinked: "未連動",
    appearance: "外觀模式", dark: "🌙 黑色", light: "☀️ 白色", language: "語言",
    bag: "背包", team: "隊伍", home: "主頁", battle: "對戰", sim: "模擬對戰",
    search: "搜索", searchPokemon: "搜索 Pokémon…", searchName: "搜索名字…",
    sort: "排序", filter: "篩選", apply: "套用", clear: "清除", cancel: "取消", save: "儲存", confirm: "確認",
    new: "新建", add: "新增", remove: "移除", removeAvatar: "移除頭像",
    nickname: "暱稱", ability: "特性", nature: "性格", item: "道具", moves: "技能",
    evs: "努力值", stats: "種族值",
    sortNo: "編號", sortType: "屬性", sortFav: "我的最愛", sortAdded: "加入時間",
    sortHp: "HP", sortAtk: "攻擊", sortDef: "防禦", sortSpa: "特攻", sortSpd: "特防", sortSpe: "速度",
    favorite: "我的最愛", openBag: "打開背包", pickFromBag: "從背包選",
    addToBag: "新增至背包", weakness: "弱點屬性", resist: "抵抗屬性", immune: "無效屬性",
    hard: "難以對抗", easy: "易對抗", recommended: "推薦配置",
    selectPokemon: "選擇 Pokémon", selectMove: "選擇技能", selectAbility: "—",
    teamEmpty: "仲未有隊伍，撳「新建」開始組隊", bagEmpty: "背包係空，撳 + 加入 Pokémon",
    noResults: "無符合結果", loading: "載入中…",
    setCurrent: "設為當前", edit: "編輯", delete: "刪除",
    backTo: "← 返回", saved: "已儲存", failed: "失敗",
    noEmptyId: "ID Name 不可留空", updated: "已更新",
    soon: "即將推出", linkSoon: "連動即將推出",
    move: "技能", noData: "無資料",
  },
  "zh-CN": {
    menu: "菜单", account: "账号", settings: "设置", logout: "登出",
    dex: "图鉴", teamShare: "队伍分享", reportIssue: "回报问题", shareApp: "分享此 APP",
    idName: "ID Name", email: "Email", linkedAccounts: "联动账号", notLinked: "未联动",
    appearance: "外观模式", dark: "🌙 暗色", light: "☀️ 亮色", language: "语言",
    bag: "背包", team: "队伍", home: "主页", battle: "对战", sim: "模拟对战",
    search: "搜索", searchPokemon: "搜索 Pokémon…", searchName: "搜索名字…",
    sort: "排序", filter: "筛选", apply: "套用", clear: "清除", cancel: "取消", save: "保存", confirm: "确认",
    new: "新建", add: "新增", remove: "移除", removeAvatar: "移除头像",
    nickname: "昵称", ability: "特性", nature: "性格", item: "道具", moves: "技能",
    evs: "努力值", stats: "种族值",
    sortNo: "编号", sortType: "属性", sortFav: "我的最爱", sortAdded: "加入时间",
    sortHp: "HP", sortAtk: "攻击", sortDef: "防御", sortSpa: "特攻", sortSpd: "特防", sortSpe: "速度",
    favorite: "我的最爱", openBag: "打开背包", pickFromBag: "从背包选",
    addToBag: "加入背包", weakness: "弱点属性", resist: "抵抗属性", immune: "无效属性",
    hard: "难以对抗", easy: "易对抗", recommended: "推荐配置",
    selectPokemon: "选择 Pokémon", selectMove: "选择技能", selectAbility: "—",
    teamEmpty: "还没有队伍，点击「新建」开始组队", bagEmpty: "背包是空的，点 + 加入 Pokémon",
    noResults: "无符合结果", loading: "载入中…",
    setCurrent: "设为当前", edit: "编辑", delete: "删除",
    backTo: "← 返回", saved: "已保存", failed: "失败",
    noEmptyId: "ID Name 不可为空", updated: "已更新",
    soon: "即将推出", linkSoon: "联动即将推出",
    move: "技能", noData: "无数据",
  },
  en: {
    menu: "Menu", account: "Account", settings: "Settings", logout: "Logout",
    dex: "Pokédex", teamShare: "Team Share", reportIssue: "Report Issue", shareApp: "Share this App",
    idName: "ID Name", email: "Email", linkedAccounts: "Linked Accounts", notLinked: "Not linked",
    appearance: "Appearance", dark: "🌙 Dark", light: "☀️ Light", language: "Language",
    bag: "Bag", team: "Team", home: "Home", battle: "Battle", sim: "Sim Battle",
    search: "Search", searchPokemon: "Search Pokémon…", searchName: "Search name…",
    sort: "Sort", filter: "Filter", apply: "Apply", clear: "Clear", cancel: "Cancel", save: "Save", confirm: "Confirm",
    new: "New", add: "Add", remove: "Remove", removeAvatar: "Remove avatar",
    nickname: "Nickname", ability: "Ability", nature: "Nature", item: "Item", moves: "Moves",
    evs: "EVs", stats: "Base Stats",
    sortNo: "No.", sortType: "Type", sortFav: "Favorite", sortAdded: "Date Added",
    sortHp: "HP", sortAtk: "Atk", sortDef: "Def", sortSpa: "SpA", sortSpd: "SpD", sortSpe: "Spe",
    favorite: "Favorite", openBag: "Open Bag", pickFromBag: "From Bag",
    addToBag: "Add to Bag", weakness: "Weak to", resist: "Resists", immune: "Immune",
    hard: "Hard matchups", easy: "Easy matchups", recommended: "Recommended",
    selectPokemon: "Select Pokémon", selectMove: "Select move", selectAbility: "—",
    teamEmpty: "No teams yet — tap “New” to start.", bagEmpty: "Bag is empty — tap + to add a Pokémon.",
    noResults: "No matches", loading: "Loading…",
    setCurrent: "Set current", edit: "Edit", delete: "Delete",
    backTo: "← Back", saved: "Saved", failed: "Failed",
    noEmptyId: "ID Name can't be empty", updated: "Updated",
    soon: "Coming soon", linkSoon: "Linking coming soon",
    move: "Move", noData: "No data",
  },
  ja: {
    menu: "メニュー", account: "アカウント", settings: "設定", logout: "ログアウト",
    dex: "図鑑", teamShare: "チーム共有", reportIssue: "問題を報告", shareApp: "アプリを共有",
    idName: "ID Name", email: "Email", linkedAccounts: "連携アカウント", notLinked: "未連携",
    appearance: "テーマ", dark: "🌙 ダーク", light: "☀️ ライト", language: "言語",
    bag: "バッグ", team: "パーティ", home: "ホーム", battle: "バトル", sim: "シミュ",
    search: "検索", searchPokemon: "ポケモンを検索…", searchName: "名前を検索…",
    sort: "並び替え", filter: "フィルター", apply: "適用", clear: "クリア", cancel: "キャンセル", save: "保存", confirm: "確認",
    new: "新規", add: "追加", remove: "削除", removeAvatar: "画像を削除",
    nickname: "ニックネーム", ability: "特性", nature: "性格", item: "持ち物", moves: "技",
    evs: "努力値", stats: "種族値",
    sortNo: "図鑑番号", sortType: "タイプ", sortFav: "お気に入り", sortAdded: "追加日",
    sortHp: "HP", sortAtk: "攻撃", sortDef: "防御", sortSpa: "特攻", sortSpd: "特防", sortSpe: "素早さ",
    favorite: "お気に入り", openBag: "バッグを開く", pickFromBag: "バッグから",
    addToBag: "バッグに追加", weakness: "弱点", resist: "耐性", immune: "無効",
    hard: "苦手", easy: "得意", recommended: "おすすめ",
    selectPokemon: "ポケモンを選択", selectMove: "技を選択", selectAbility: "—",
    teamEmpty: "パーティがありません。「新規」で作成。", bagEmpty: "バッグが空。+ で追加。",
    noResults: "該当なし", loading: "読み込み中…",
    setCurrent: "現在に設定", edit: "編集", delete: "削除",
    backTo: "← 戻る", saved: "保存しました", failed: "失敗",
    noEmptyId: "ID Name は必須です", updated: "更新しました",
    soon: "近日公開", linkSoon: "連携は近日公開",
    move: "技", noData: "データなし",
  },
  ko: {
    menu: "메뉴", account: "계정", settings: "설정", logout: "로그아웃",
    dex: "도감", teamShare: "팀 공유", reportIssue: "문제 신고", shareApp: "앱 공유",
    idName: "ID Name", email: "Email", linkedAccounts: "연동 계정", notLinked: "연동 안 됨",
    appearance: "테마", dark: "🌙 다크", light: "☀️ 라이트", language: "언어",
    bag: "가방", team: "팀", home: "홈", battle: "배틀", sim: "시뮬",
    search: "검색", searchPokemon: "포켓몬 검색…", searchName: "이름 검색…",
    sort: "정렬", filter: "필터", apply: "적용", clear: "지우기", cancel: "취소", save: "저장", confirm: "확인",
    new: "새로 만들기", add: "추가", remove: "삭제", removeAvatar: "사진 삭제",
    nickname: "별명", ability: "특성", nature: "성격", item: "도구", moves: "기술",
    evs: "노력치", stats: "종족값",
    sortNo: "번호", sortType: "타입", sortFav: "즐겨찾기", sortAdded: "추가일",
    sortHp: "HP", sortAtk: "공격", sortDef: "방어", sortSpa: "특공", sortSpd: "특방", sortSpe: "스피드",
    favorite: "즐겨찾기", openBag: "가방 열기", pickFromBag: "가방에서",
    addToBag: "가방에 추가", weakness: "약점", resist: "저항", immune: "무효",
    hard: "불리", easy: "유리", recommended: "추천",
    selectPokemon: "포켓몬 선택", selectMove: "기술 선택", selectAbility: "—",
    teamEmpty: "팀이 없습니다. ‘새로 만들기’를 누르세요.", bagEmpty: "가방이 비었습니다. +로 추가하세요.",
    noResults: "결과 없음", loading: "로딩 중…",
    setCurrent: "현재로 설정", edit: "수정", delete: "삭제",
    backTo: "← 뒤로", saved: "저장됨", failed: "실패",
    noEmptyId: "ID Name 은 비울 수 없습니다", updated: "업데이트됨",
    soon: "곧 공개", linkSoon: "연동 곧 공개",
    move: "기술", noData: "데이터 없음",
  },
};

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; }
const LangContext = createContext<Ctx>({ lang: "zh-TW", setLang: () => {}, t: (k) => k });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try { return (localStorage.getItem("lang") as Lang) || "zh-TW"; } catch { return "zh-TW"; }
  });
  useEffect(() => {
    try { localStorage.setItem("lang", lang); } catch {}
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => setLangState(l);
  const t = (k: string) => dict[lang]?.[k] ?? dict["zh-TW"][k] ?? k;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
};

export const useT = () => useContext(LangContext);
