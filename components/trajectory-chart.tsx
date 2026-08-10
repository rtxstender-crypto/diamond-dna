import type { TrajectoryPlayer } from "@/data/players";

type Series = { name: string; color: string; series: { age: number; war: number }[] };

export function TrajectoryChart({ player, comparisons }: { player: TrajectoryPlayer; comparisons: Series[] }) {
  const all = [{ name: player.name, color: "#d3ff62", series: player.series }, ...comparisons];
  const maxWar = Math.max(...all.flatMap(x => x.series.map(p => p.war)), 20);
  const minAge = Math.min(...all.flatMap(x => x.series.map(p => p.age)));
  const maxAge = Math.max(...all.flatMap(x => x.series.map(p => p.age)));
  const xy = (age: number, war: number) => ({ x: ((age-minAge)/(maxAge-minAge))*100, y: 100-(war/maxWar)*100 });
  return <div className="chart-card">
    <div className="chart-head"><div><span>CAREER WAR BY AGE</span><h3>Trajectory comparison</h3></div><div className="legend">{all.map(s => <span key={s.name}><i style={{background:s.color}}/>{s.name}</span>)}</div></div>
    <div className="chart-area" role="img" aria-label={`Career WAR by age comparison for ${player.name}`}>
      <div className="y-labels">{[maxWar, maxWar*.75, maxWar*.5, maxWar*.25, 0].map(n => <span key={n}>{Math.round(n)}</span>)}</div>
      <div className="plot">
        {[0,1,2,3,4].map(n => <i className="gridline" style={{top:`${n*25}%`}} key={n}/>)}
        {all.map(s => s.series.slice(0,-1).map((p,i) => { const a=xy(p.age,p.war), b=xy(s.series[i+1].age,s.series[i+1].war); const dx=b.x-a.x, dy=b.y-a.y; return <i className="chart-line" key={`${s.name}-${i}`} style={{ left:`${a.x}%`, top:`${a.y}%`, width:`${Math.hypot(dx,dy)}%`, transform:`rotate(${Math.atan2(dy,dx)}rad)`, background:s.color }}/>}))}
        {all.map(s => s.series.map(p => { const q=xy(p.age,p.war); return <i className="chart-dot" key={`${s.name}-${p.age}`} style={{left:`${q.x}%`,top:`${q.y}%`,borderColor:s.color}}/>}))}
      </div>
      <div className="x-labels">{Array.from({length:maxAge-minAge+1},(_,i)=>minAge+i).map(a=><span key={a}>{a}</span>)}</div>
    </div>
    <div className="chart-axis">AGE</div>
  </div>;
}
