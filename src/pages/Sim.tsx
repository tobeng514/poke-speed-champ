const Sim = () => (
  <div className="px-4 py-6 space-y-3">
    <p className="text-sm font-semibold">模擬對戰</p>
    <p className="text-sm text-muted-foreground">
      用嚟測試努力值分配、特性、性格、道具、招式組合。即將推出。
    </p>
    <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
      <li>單打 / 雙打模式切換</li>
      <li>2 / 4 個泡泡，每個可調 EV / 性格 / 特性 / 道具</li>
      <li>點 Pokémon 跳出可用招式選單</li>
      <li>模擬光牆、反射壁、友情防守下嘅 HP / 出手順序</li>
    </ul>
  </div>
);

export default Sim;
