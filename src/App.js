import React, { useState, useEffect } from 'react';

function App() {
  // --- CONFIG & DYNAMIC OBJECTIVES ---
  const [config] = useState({ basePoints: 1000, timeoutDeduction: 100, penaltyDeduction: 50 });
  const [objectives, setObjectives] = useState([
    { id: 1, name: 'The Slalom', pts: 100 },
    { id: 2, name: 'Ramp Climb', pts: 150 },
    { id: 3, name: 'Autonomous Zone', pts: 300 }
  ]);
  
  const [registry, setRegistry] = useState([
    { rank: 1, id: '101', name: 'CyberKnights', school: 'TECH ACADEMY', best: 0, sessions: 0 },
    { rank: 2, id: '202', name: 'RoboRaptors', school: 'LINCOLN HIGH', best: 0, sessions: 0 }
  ]);
  const [newUnit, setNewUnit] = useState({ id: '', name: '', school: '' });
  const [searchQuery, setSearchQuery] = useState("");

  // --- MISSION & MEDIA STATES ---
  const [screen, setScreen] = useState('home'); 
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [archive, setArchive] = useState([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [scores, setScores] = useState({}); 
  const [timeouts, setTimeouts] = useState(0);
  const [penalties, setPenalties] = useState(0);
  
  const [teamPhoto, setTeamPhoto] = useState(null);
  const [robotPhoto, setRobotPhoto] = useState(null);

  const theme = {
    bg: '#02060D', card: '#0A1019', header: '#0E1621',
    cyan: '#00E5FF', red: '#FF4D4D', grey: '#4B5563', text: '#FFFFFF',
    border: '#1E293B', green: '#10B981', amber: '#FFB300', blue: '#2563EB',
    gold: '#FFD700', silver: '#C0C0C0', bronze: '#CD7F32'
  };

  useEffect(() => {
    let interval;
    if (isRunning) interval = setInterval(() => setTime(t => t + 0.01), 10);
    return () => clearInterval(interval);
  }, [isRunning]);

  const liveScore = () => {
    const obsPoints = Object.values(scores).reduce((a, b) => a + b, 0);
    const total = config.basePoints + obsPoints - (penalties * config.penaltyDeduction) - (timeouts * config.timeoutDeduction);
    return total < 0 ? 0 : total;
  };

  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) setter(URL.createObjectURL(file));
  };

  const initiateMission = (unit) => {
    setSelectedUnit(unit);
    setScreen('scoring');
    setTime(0); setIsRunning(false); setScores({}); setTimeouts(0); setPenalties(0);
    setTeamPhoto(null); setRobotPhoto(null);
  };

  const finalizeRun = () => {
    const finalVal = liveScore();
    const receipt = { id: selectedUnit.id, name: selectedUnit.name, score: finalVal, time: time.toFixed(2), timestamp: new Date().toLocaleTimeString() };
    setArchive([receipt, ...archive].slice(0, 5));
    setRegistry(registry.map(u => u.id === selectedUnit.id ? 
      { ...u, best: finalVal > u.best ? finalVal : u.best, sessions: u.sessions + 1 } : u
    ).sort((a,b) => b.best - a.best).map((u, i) => ({...u, rank: i + 1})));
    setScreen('home');
  };

  const exportCSV = () => {
    const head = "Rank,ID,Name,Best Score,Sessions\n";
    const data = registry.map(u => `${u.rank},${u.id},${u.name},${u.best},${u.sessions}`).join("\n");
    const blob = new Blob([head + data], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'RoboScan_Final_Rankings.csv'; a.click();
  };

  const styles = {
    container: { backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', padding: '15px', paddingBottom: '100px', boxSizing: 'border-box' },
    card: { backgroundColor: theme.card, borderRadius: '24px', padding: '20px', border: `1px solid ${theme.border}`, marginBottom: '15px' },
    input: { width: '100%', backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.cyan, padding: '12px', borderRadius: '12px', marginBottom: '10px', outline: 'none' },
    photoSlot: { flex: 1, height: '120px', backgroundColor: theme.header, borderRadius: '16px', border: `1px dashed ${theme.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' },
    statusCircle: (active, color) => ({ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${active ? color : '#334155'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? color : '#334155', cursor: 'pointer', backgroundColor: active ? color + '22' : 'transparent' })
  };

  return (
    <div style={styles.container}>
      
      {/* 1. COMMAND DECK (UPDATED) */}
      {screen === 'home' && (
        <div>
          <h1 style={{fontSize:'24px', fontWeight:'900'}}>COMMAND <span style={{color:theme.cyan}}>DECK</span></h1>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'20px'}}>
            <div style={styles.card}><span style={{fontSize:'9px', color:theme.grey, fontWeight:'bold'}}>TOTAL UNITS</span><span style={{fontSize:'28px', fontWeight:'900', display:'block'}}>{registry.length}</span></div>
            <div style={styles.card}><span style={{fontSize:'9px', color:theme.grey, fontWeight:'bold'}}>ACTIVE SESSION</span><span style={{fontSize:'28px', fontWeight:'900', display:'block', color: selectedUnit && screen !== 'home' ? theme.green : theme.red}}>{selectedUnit ? 'LIVE' : 'IDLE'}</span></div>
          </div>
          
          <div style={{...styles.card, border:`1px solid ${theme.cyan}44`}}>
            <span style={{fontSize:'9px', color:theme.cyan, fontWeight:'bold'}}>TOP PERFORMANCE</span>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:'5px'}}>
              <span style={{fontSize:'22px', fontWeight:'900'}}>{registry[0]?.name || "N/A"}</span>
              <span style={{fontSize:'22px', fontWeight:'900', color:theme.gold}}>{registry[0]?.best || 0} PTS</span>
            </div>
          </div>

          <h3 style={{fontSize:'11px', color:theme.grey, margin:'15px 0 10px', letterSpacing:'1px'}}>LIVE TELEMETRY STREAM</h3>
          {archive.length === 0 && <div style={{...styles.card, textAlign:'center', color:theme.grey, fontSize:'12px'}}>Waiting for finalized data...</div>}
          {archive.map((log, i) => (
            <div key={i} style={{...styles.card, padding:'12px', display:'flex', justifyContent:'space-between', borderLeft:`4px solid ${theme.cyan}`, marginBottom:'10px'}}>
              <div><div style={{fontWeight:'bold', fontSize:'14px'}}>{log.name}</div><div style={{fontSize:'10px', color:theme.grey}}>{log.timestamp} • {log.time}s</div></div>
              <div style={{fontSize:'18px', fontWeight:'900', color:theme.cyan}}>{log.score}</div>
            </div>
          ))}
        </div>
      )}

      {/* 2. SCANNER */}
      {screen === 'scan' && (
        <div>
          <h2 style={{fontWeight:'bold', textAlign:'center'}}>UNIT <span style={{color:theme.cyan}}>SCAN</span></h2>
          <div style={{height:'100px', backgroundColor:theme.card, borderRadius:'20px', margin:'20px 0', border:`1px solid ${theme.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:theme.grey, fontSize:'12px'}}>OPTICAL SCANNER READY</div>
          {registry.map(u => (
            <div key={u.id} onClick={() => initiateMission(u)} style={{...styles.card, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div><span style={{fontWeight:'bold'}}>#{u.id}</span> <span style={{marginLeft:'10px'}}>{u.name}</span></div>
              <span style={{color:theme.cyan, fontSize:'12px', fontWeight:'bold'}}>SELECT →</span>
            </div>
          ))}
        </div>
      )}

      {/* 3. SCORING PAGE (PARTIAL COMPLETION ADDED) */}
      {screen === 'scoring' && selectedUnit && (
        <div>
          <div style={{...styles.card, display:'flex', justifyContent:'space-between', backgroundColor:theme.header}}>
            <div><div style={{fontWeight:'bold'}}>{selectedUnit.name}</div><div style={{fontSize:'10px', color:theme.grey}}>UNIT ID: {selectedUnit.id}</div></div>
            <div style={{textAlign:'right'}}><div style={{fontSize:'10px', color:theme.grey}}>LIVE SCORE</div><div style={{fontSize:'28px', fontWeight:'900', color:theme.cyan}}>{liveScore()}</div></div>
          </div>

          <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
            <label style={styles.photoSlot}>
              <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, setTeamPhoto)} />
              {teamPhoto ? <img src={teamPhoto} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Team" /> : <span style={{fontSize:'9px', textAlign:'center', color:theme.grey}}>+ TEAM PHOTO</span>}
            </label>
            <label style={styles.photoSlot}>
              <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, setRobotPhoto)} />
              {robotPhoto ? <img src={robotPhoto} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Robot" /> : <span style={{fontSize:'9px', textAlign:'center', color:theme.grey}}>+ ROBOT PHOTO</span>}
            </label>
          </div>

          <div style={styles.card}>
            <div style={{fontSize:'42px', fontWeight:'900', textAlign:'center', fontFamily:'monospace'}}>{time.toFixed(2)}s</div>
            <button onClick={()=>setIsRunning(!isRunning)} style={{width:'100%', padding:'15px', background:isRunning?theme.red:theme.green, border:'none', borderRadius:'12px', color:'white', fontWeight:'bold', marginTop:'10px'}}>{isRunning?'PAUSE MISSION':'START MISSION'}</button>
          </div>

          <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
            <div onClick={()=>setTimeouts(t=>t+1)} style={{...styles.card, flex:1, margin:0, textAlign:'center'}}>
              <div style={{fontSize:'24px', fontWeight:'900'}}>{timeouts}</div><div style={{fontSize:'9px', color:theme.grey}}>TIMEOUTS</div>
            </div>
            <div onClick={()=>setPenalties(p=>p+1)} style={{...styles.card, flex:1, margin:0, textAlign:'center'}}>
              <div style={{fontSize:'24px', fontWeight:'900', color:theme.red}}>{penalties}</div><div style={{fontSize:'9px', color:theme.red}}>PENALTIES</div>
            </div>
          </div>

          <div style={styles.card}>
            <span style={{fontSize:'10px', color:theme.grey, fontWeight:'bold'}}>OBSTACLE CHECKLIST (0% | 50% | 100%)</span>
            {objectives.map(obj => (
              <div key={obj.id} style={{display:'grid', gridTemplateColumns:'1fr 50px 120px', alignItems:'center', padding:'15px 0', borderBottom:`1px solid ${theme.border}44`}}>
                <span style={{fontSize:'13px', fontWeight:'bold'}}>{obj.name}</span>
                <span style={{color:theme.cyan, fontSize:'11px'}}>+{obj.pts}</span>
                <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
                  <div onClick={()=>setScores({...scores, [obj.name]:0})} style={styles.statusCircle(scores[obj.name]===0, theme.red)}>×</div>
                  <div onClick={()=>setScores({...scores, [obj.name]:obj.pts * 0.5})} style={styles.statusCircle(scores[obj.name]===obj.pts*0.5, theme.amber)}>½</div>
                  <div onClick={()=>setScores({...scores, [obj.name]:obj.pts})} style={styles.statusCircle(scores[obj.name]===obj.pts, theme.green)}>✓</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={finalizeRun} style={{width:'100%', padding:'18px', background:theme.blue, border:'none', borderRadius:'40px', color:'white', fontWeight:'bold', fontSize:'16px', boxShadow:`0 10px 20px ${theme.blue}44`}}>FINALIZE MISSION</button>
        </div>
      )}

      {/* 4. MISSION CONTROL */}
      {screen === 'control' && (
        <div>
          <h1 style={{fontSize:'24px', fontWeight:'900'}}>MISSION <span style={{color:theme.cyan}}>CONTROL</span></h1>
          
          <div style={styles.card}>
            <span style={{fontSize:'10px', color:theme.cyan, fontWeight:'bold'}}>PROTOCOL ARCHITECT (OBSTACLES)</span>
            <div style={{marginTop:'10px'}}>
              {objectives.map((obj, i) => (
                <div key={obj.id} style={{display:'flex', gap:'8px', marginBottom:'10px'}}>
                  <input style={{...styles.input, flex:3, marginBottom:0}} value={obj.name} placeholder="Name" onChange={(e) => { const n = [...objectives]; n[i].name = e.target.value; setObjectives(n); }} />
                  <input type="number" style={{...styles.input, flex:1.5, marginBottom:0}} value={obj.pts} placeholder="Pts" onChange={(e) => { const n = [...objectives]; n[i].pts = parseInt(e.target.value) || 0; setObjectives(n); }} />
                  <button onClick={() => setObjectives(objectives.filter(o => o.id !== obj.id))} style={{background:theme.red, color:'white', border:'none', borderRadius:'10px', padding:'0 15px'}}>🗑</button>
                </div>
              ))}
              <button onClick={()=>setObjectives([...objectives, {id: Date.now(), name:'', pts: 100}])} style={{width:'100%', padding:'12px', background:theme.header, border:`1px solid ${theme.cyan}`, color:theme.cyan, borderRadius:'12px', marginTop:'5px', fontWeight:'bold'}}>+ NEW OBJECTIVE</button>
            </div>
          </div>

          <div style={styles.card}>
            <span style={{fontSize:'10px', color:theme.cyan, fontWeight:'bold'}}>REGISTRY ENROLLMENT</span>
            <input placeholder="Unit ID" style={styles.input} value={newUnit.id} onChange={(e)=>setNewUnit({...newUnit, id: e.target.value})} />
            <input placeholder="Team Name" style={styles.input} value={newUnit.name} onChange={(e)=>setNewUnit({...newUnit, name: e.target.value})} />
            <button onClick={() => { if(newUnit.id) setRegistry([...registry, {...newUnit, rank: registry.length+1, best:0, sessions:0}]); setNewUnit({id:'', name:''}); }} style={{width:'100%', padding:'12px', background:theme.blue, color:'white', border:'none', borderRadius:'10px', fontWeight:'bold'}}>ENROLL UNIT</button>
          </div>
        </div>
      )}

      {/* 5. HALL OF GLORY (CSV EXPORT ADDED) */}
      {screen === 'stats' && (
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h1 style={{fontSize:'24px', fontWeight:'900', margin:0}}>HALL OF <span style={{color:theme.cyan}}>GLORY</span></h1>
            <button onClick={exportCSV} style={{background:theme.green, border:'none', color:'white', padding:'8px 15px', borderRadius:'10px', fontSize:'10px', fontWeight:'bold'}}>📤 EXPORT</button>
          </div>
          <input placeholder="🔍 Search Unit ID or Name..." style={{...styles.input, marginBottom:'20px'}} value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} />
          {registry.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery)).map(u => (
            <div key={u.id} style={{...styles.card, display:'flex', alignItems:'center', padding:'15px', borderLeft: u.rank === 1 ? `4px solid ${theme.gold}` : `1px solid ${theme.border}`}}>
              <div style={{width:'40px', height:'40px', backgroundColor:theme.header, borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', marginRight:'15px', fontWeight:'bold', color: u.rank === 1 ? theme.gold : theme.text, border: `1px solid ${u.rank === 1 ? theme.gold : theme.border}`}}>#{u.rank}</div>
              <div style={{flex:1}}><div style={{fontWeight:'bold'}}>{u.name.toUpperCase()}</div><div style={{fontSize:'10px', color:theme.grey}}>BEST: {u.best} PTS • {u.sessions} SESSIONS</div></div>
              <div style={{textAlign:'right', fontWeight:'900', color:theme.cyan, fontSize:'20px'}}>{u.best}</div>
            </div>
          ))}
        </div>
      )}

      {/* NAV BAR */}
      <div style={{position:'fixed', bottom:0, left:0, width:'100%', height:'80px', backgroundColor:theme.header, borderTop:`1px solid ${theme.border}`, display:'flex', justifyContent:'space-around', alignItems:'center', zIndex:1000}}>
        <div onClick={()=>setScreen('home')} style={{fontSize:'24px', cursor:'pointer', opacity: screen === 'home' ? 1 : 0.5}}>🏠</div>
        <div onClick={()=>setScreen('scan')} style={{width:'50px', height:'50px', borderRadius:'50%', border:`2px solid ${theme.cyan}`, display:'flex', alignItems:'center', justifyContent:'center', marginTop:'-30px', backgroundColor:theme.bg, cursor:'pointer', boxShadow:`0 0 15px ${theme.cyan}44`}}>🔳</div>
        <div onClick={()=>setScreen('control')} style={{fontSize:'24px', cursor:'pointer', opacity: screen === 'control' ? 1 : 0.5}}>⚙️</div>
        <div onClick={()=>setScreen('stats')} style={{fontSize:'24px', cursor:'pointer', opacity: screen === 'stats' ? 1 : 0.5}}>📊</div>
      </div>
    </div>
  );
}

export default App;
