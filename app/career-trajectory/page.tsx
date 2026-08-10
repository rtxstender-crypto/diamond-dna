import {TrajectoryExplorer} from "@/components/trajectory-explorer";
import {Eyebrow} from "@/components/ui";
export default function CareerTrajectoryPage(){return <div className="subpage page-width trajectory-page"><header className="page-header trajectory-title"><div><Eyebrow>CAREER DNA ANALYSIS</Eyebrow><h1>Career <em>Trajectory</em></h1><p>Connect today&apos;s performance curve to the careers that came before.</p></div><div className="trajectory-data-label"><span>DATA SOURCE</span><strong>MLB STATS API</strong><small>● REAL SEASON DATA</small></div></header><TrajectoryExplorer/></div>}
