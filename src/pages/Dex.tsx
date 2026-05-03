const Dex = () => (
  <div className="px-4 py-6 space-y-3">
    <p className="text-sm font-semibold">圖鑑</p>
    <p className="text-sm text-muted-foreground">
      所有 Pokémon 列表（頭像為問號，可上傳自訂圖片）即將推出。
    </p>
    <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
      <li>數值、推薦配招、推薦努力值</li>
      <li>難 / 易對抗的 Pokémon</li>
      <li>長按頭像：觀看 / 設定 / 退出</li>
    </ul>
  </div>
);

export default Dex;
