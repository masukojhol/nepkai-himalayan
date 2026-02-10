import { useState, useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════
// NepkAI — "Kala Patthar" Theme
// Colors: Black mountain rock + White snow
// ═══════════════════════════════════════════════════

const MODELS = [
  { id:"auto", name:"NepkAI Auto", desc:"Smart routing — best model picked", icon:"⚡", color:"#e2e8f0" },
  { id:"gemini", name:"Gemini Flash", desc:"Free · Fast responses", icon:"✦", color:"#38bdf8", tag:"FREE" },
  { id:"groq", name:"Groq Llama 3.3", desc:"Free · Ultra fast 300 tok/s", icon:"🚀", color:"#94a3b8", tag:"FREE" },
  { id:"codestral", name:"Codestral", desc:"Free · Code specialist", icon:"⌨", color:"#60a5fa", tag:"FREE" },
  { id:"haiku", name:"Claude Haiku", desc:"Quality + speed balance", icon:"◆", color:"#a78bfa", tag:"PRO" },
  { id:"sonnet", name:"Claude Sonnet", desc:"Best reasoning & agentic", icon:"◈", color:"#f472b6", tag:"PRO" },
];

const PERSONAS = [
  { id:"default", name:"General Assistant", icon:"🏔", color:"#e2e8f0" },
  { id:"nibedan", name:"निवेदन Writer", icon:"📄", color:"#38bdf8" },
  { id:"coder", name:"Code Assistant", icon:"⌨", color:"#60a5fa" },
  { id:"loksewa", name:"लोकसेवा Prep", icon:"📚", color:"#94a3b8" },
  { id:"cv", name:"CV Builder", icon:"📋", color:"#f472b6" },
  { id:"korean", name:"Korean Teacher", icon:"🇰🇷", color:"#34d399" },
];

const CHATS = [
  { id:"1", title:"निवेदन for ward office", time:"2h ago", icon:"📄", msgs:[
    {role:"user",content:"वडा कार्यालयमा पठाउने निवेदन बनाइदिनुस्"},
    {role:"ai",content:"म तपाईंको निवेदन तयार गर्छु! 📄\n\nकृपया यी विवरणहरू दिनुहोस्:\n\n**1.** कुन वडा नम्बर?\n**2.** विषय के हो?\n**3.** तपाईंको पूरा नाम?\n**4.** ठेगाना र फोन नम्बर?\n\n✨ ३० सेकेन्डमा PDF तयार हुन्छ!",model:"auto"},
  ]},
  { id:"2", title:"Express JWT auth", time:"5h ago", icon:"⌨", msgs:[
    {role:"user",content:"Build a login page with JWT authentication in Express.js"},
    {role:"ai",content:"I'll create a complete JWT auth system!\n\n```\n📋 Plan:\n├── Step 1: User model with bcrypt\n├── Step 2: Auth routes (login/register)\n├── Step 3: JWT middleware\n└── Step 4: Protected routes\n```\n\nShall I proceed?",model:"codestral"},
  ]},
  { id:"3", title:"लोकसेवा GK Quiz", time:"Yesterday", icon:"📚", msgs:[] },
  { id:"4", title:"Professional CV", time:"Yesterday", icon:"📋", msgs:[] },
  { id:"5", title:"भाडा सम्झौता draft", time:"3 days ago", icon:"📄", msgs:[] },
  { id:"6", title:"Korean 안녕하세요", time:"Last week", icon:"🇰🇷", msgs:[] },
];

function respond(text) {
  const np = /[\u0900-\u097F]/.test(text), lo = text.toLowerCase();
  if (lo.includes("निवेदन")) return "म तपाईंको निवेदन तयार गर्छु! 📄\n\nकृपया यी जानकारी दिनुहोस्:\n\n**1.** कुन कार्यालयमा?\n**2.** विषय?\n**3.** पूरा नाम?\n**4.** ठेगाना?\n\n✨ PDF ३० सेकेन्डमा!";
  if (lo.match(/code|build|function|debug|express|react|api/)) return "I'll help you build that! Here's the plan:\n\n```\n📋 Implementation:\n├── Step 1: Project setup\n├── Step 2: Core modules\n├── Step 3: Auth layer\n├── Step 4: Tests\n└── Step 5: Deploy\n```\n\n**4 files · ~120 lines**\n\nProceed? *(y/n)*";
  if (lo.match(/quiz|लोकसेवा|loksewa/)) return "📚 **लोकसेवा Quiz — सामान्य ज्ञान**\n\n**Q1/5:** नेपालको राष्ट्रिय फूल के हो?\n\n`A)` गुराँस\n`B)` सूर्यमुखी\n`C)` गोल्डमोहर\n`D)` ललिगुराँस\n\n📊 *Streak: 3 days 🔥 | Avg: 72%*";
  if (lo.match(/cv|resume/)) return "I'll create your professional CV! 📋\n\nShare:\n**1.** Full name\n**2.** Target role\n**3.** Experience\n**4.** Top 5 skills\n**5.** Contact info\n\n🎨 **Templates:** Modern · Classic · Minimal\n\n✨ PDF in 2 minutes!";
  if (lo.match(/भाडा|rent|agreement/)) return "भाडा सम्झौता बनाउँछु! 🏠\n\n**घरधनी:** नाम, ठेगाना, नागरिकता नं\n**भाडावाल:** नाम, ठेगाना, नागरिकता नं\n**सम्पत्ति:** ठेगाना, भाडा, धरौटी\n\n✨ कानुनी PDF तैयार!";
  if (np) return "नमस्ते! 🙏 म NepkAI हुँ — नेपालको AI।\n\n• 📄 निवेदन / कागजात\n• ⌨ कोड\n• 📚 लोकसेवा\n• 📋 CV\n\nआज के गर्ने? 🏔";
  return "Hello! 🙏 I'm **NepkAI** — Nepal's AI, from the top of the world.\n\n• 📄 **Documents** — निवेदन, agreements as PDF\n• ⌨ **Code** — Write, debug, explain\n• 📚 **Loksewa** — Quiz with tracking\n• 📋 **CV Builder** — Professional PDF\n\nPowered by Gemini · Claude · Groq\n\nWhat can I help with? 🏔";
}

function md(t) {
  return t
    .replace(/```([\s\S]*?)```/g, (_, c) => `<pre style="background:rgba(45,55,72,0.6);border-radius:10px;padding:12px 14px;margin:8px 0;font-family:'JetBrains Mono',monospace;font-size:12px;color:#e2e8f0;border:1px solid rgba(255,255,255,0.1);overflow-x:auto;line-height:1.6;backdrop-filter:blur(4px)">${c}</pre>`)
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 7px;border-radius:5px;font-family:\'JetBrains Mono\',monospace;font-size:12px;color:#f7fafc;border:1px solid rgba(255,255,255,0.1)">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffffff;font-weight:600">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color:#94a3b8">$1</em>')
    .replace(/\n/g, '<br/>');
}

export default function App() {
  const [chats, setChats] = useState(CHATS);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [typing, setTyping] = useState(false);
  const [dd, setDd] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebar, setSidebar] = useState(true);
  const endRef = useRef(null);

  const active = chats.find(c => c.id === activeId);
  const msgs = active?.msgs || [];
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);

  const newChat = () => { const id=Date.now().toString(); setChats(p=>[{id,title:"New chat",time:"Now",icon:"🏔",msgs:[]},...p]); setActiveId(id); setInput(""); setDd(null); };

  const send = () => {
    if (!input.trim()||typing) return;
    const t=input.trim(); setInput("");
    let tid=activeId;
    if(!tid){const id=Date.now().toString();setChats(p=>[{id,title:t.slice(0,35),time:"Now",icon:"🏔",msgs:[]},...p]);tid=id;setActiveId(id);}
    setChats(p=>p.map(c=>c.id===tid?{...c,title:c.msgs.length===0?t.slice(0,35):c.title,msgs:[...c.msgs,{role:"user",content:t}]}:c));
    setTyping(true);
    setTimeout(()=>{
      setChats(p=>p.map(c=>c.id===tid?{...c,msgs:[...c.msgs,{role:"ai",content:respond(t),model:model.id}]}:c));
      setTyping(false);
    },600+Math.random()*900);
  };

  const filtered = search ? chats.filter(c=>c.title.toLowerCase().includes(search.toLowerCase())) : chats;

  return (
    <div style={{display:"flex",height:"100vh",background:"#1a202c",fontFamily:"'Outfit',system-ui,sans-serif",overflow:"hidden",color:"#e2e8f0",position:"relative"}}
      onClick={()=>setDd(null)}>

      {/* ═══ KALA PATTHAR MOUNTAIN BACKGROUND ═══ */}
      {/* Sky gradient - dark to lighter gray */}
      <div style={{position:"fixed",inset:0,background:"linear-gradient(180deg, #0d1117 0%, #1a202c 25%, #2d3748 50%, #4a5568 75%, #718096 90%, #a0aec0 100%)",zIndex:0,pointerEvents:"none"}}/>
      {/* Stars */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:0.8}}>
        {Array.from({length:60}).map((_,i)=>(
          <div key={i} style={{position:"absolute",width:Math.random()*2+1,height:Math.random()*2+1,borderRadius:"50%",background:"white",
            left:`${Math.random()*100}%`,top:`${Math.random()*45}%`,
            opacity:Math.random()*0.8+0.2,
            animation:`twinkle ${2+Math.random()*3}s ease-in-out infinite ${Math.random()*3}s`,
          }}/>
        ))}
      </div>
      {/* Mountain silhouettes - dark rock */}
      <svg style={{position:"fixed",bottom:0,left:0,right:0,zIndex:0,pointerEvents:"none"}} viewBox="0 0 1440 200" preserveAspectRatio="none">
        {/* Far mountains - darker rock */}
        <polygon points="0,200 0,120 80,80 160,100 250,50 340,90 400,60 480,85 560,40 640,75 720,30 800,65 880,45 960,80 1040,35 1120,70 1200,55 1280,85 1360,60 1440,90 1440,200" fill="#2d3748"/>
        {/* Near mountains - charcoal rock */}
        <polygon points="0,200 0,155 100,130 180,145 280,100 360,125 450,85 520,110 600,90 700,115 780,80 860,105 950,75 1020,100 1100,70 1180,95 1260,110 1340,130 1440,140 1440,200" fill="#1a202c"/>
        {/* Snow on peaks - bright white */}
        <polygon points="250,100 265,92 280,100 275,105 255,105" fill="rgba(255,255,255,0.9)"/>
        <polygon points="445,85 458,75 470,85 465,90 450,90" fill="rgba(255,255,255,0.95)"/>
        <polygon points="775,80 790,70 805,80 800,86 780,86" fill="rgba(255,255,255,0.85)"/>
        <polygon points="945,75 960,63 975,75 970,82 950,82" fill="rgba(255,255,255,0.9)"/>
        <polygon points="1095,70 1110,58 1125,70 1120,77 1100,77" fill="rgba(255,255,255,0.88)"/>
        {/* Ground - dark rock */}
        <polygon points="0,200 0,175 200,170 400,165 600,163 800,167 1000,163 1200,168 1440,165 1440,200" fill="#0d1117"/>
      </svg>
      {/* Subtle mist at horizon */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,height:100,background:"linear-gradient(180deg, transparent, rgba(160,174,192,0.08))",zIndex:0,pointerEvents:"none"}}/>

      {/* ═══ SIDEBAR ═══ */}
      {sidebar && (
      <div style={{width:270,flexShrink:0,background:"rgba(26,32,44,0.9)",backdropFilter:"blur(20px)",display:"flex",flexDirection:"column",borderRight:"1px solid rgba(255,255,255,0.08)",zIndex:10,position:"relative"}}>

        {/* Logo */}
        <div style={{padding:"16px 16px 12px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            width:38,height:38,borderRadius:12,
            background:"linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #718096 100%)",
            boxShadow:"0 4px 14px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)",
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"#ffffff",fontWeight:900,fontSize:16,letterSpacing:-1,
          }}>N</div>
          <div>
            <div style={{fontSize:17,fontWeight:800,letterSpacing:-0.5,
              background:"linear-gradient(135deg, #ffffff, #e2e8f0, #ffffff)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            }}>NEPKAI</div>
            <div style={{fontSize:9,color:"#718096",fontWeight:500,letterSpacing:1.5,textTransform:"uppercase"}}>Kala Patthar</div>
          </div>
        </div>

        {/* New Chat */}
        <div style={{padding:"0 12px 10px"}}>
          <button onClick={newChat} style={{
            width:"100%",padding:"10px",background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,cursor:"pointer",
            fontFamily:"inherit",fontSize:13,fontWeight:600,color:"#ffffff",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            transition:"all 0.2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}
          ><span style={{fontSize:16}}>+</span> New Chat</button>
        </div>

        {/* Search */}
        <div style={{padding:"0 12px 8px"}}>
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"7px 11px",display:"flex",alignItems:"center",gap:7,border:"1px solid rgba(255,255,255,0.06)"}}>
            <span style={{color:"#718096",fontSize:13}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search chats..."
              style={{flex:1,background:"none",border:"none",outline:"none",fontFamily:"inherit",fontSize:12,color:"#e2e8f0"}} />
            {search && <span onClick={()=>setSearch("")} style={{cursor:"pointer",color:"#718096",fontSize:11}}>✕</span>}
          </div>
        </div>

        {/* Chat List */}
        <div style={{flex:1,overflowY:"auto",padding:"4px 8px"}}>
          {filtered.map(c=>(
            <div key={c.id} onClick={()=>{setActiveId(c.id);setDd(null)}}
              style={{
                padding:"10px 11px",borderRadius:10,marginBottom:2,cursor:"pointer",
                background:c.id===activeId?"rgba(255,255,255,0.08)":"transparent",
                borderLeft:c.id===activeId?"2px solid #ffffff":"2px solid transparent",
                display:"flex",alignItems:"center",gap:9,transition:"all 0.15s",
              }}
              onMouseEnter={e=>{if(c.id!==activeId)e.currentTarget.style.background="rgba(255,255,255,0.04)"}}
              onMouseLeave={e=>{if(c.id!==activeId)e.currentTarget.style.background="transparent"}}
            >
              <span style={{fontSize:15,width:20,textAlign:"center"}}>{c.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:c.id===activeId?600:400,color:c.id===activeId?"#ffffff":"#a0aec0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</div>
                <div style={{fontSize:10,color:"#4a5568"}}>{c.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"8px 12px 12px"}}>
          <div onClick={e=>{e.stopPropagation();setDd(dd==='connect'?null:'connect')}}
            style={{padding:"7px 10px",borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontSize:12,color:"#718096",marginBottom:8}}
            onMouseEnter={e=>e.currentTarget.style.color="#a0aec0"} onMouseLeave={e=>e.currentTarget.style.color="#718096"}>
            <span>📱</span> Connect WhatsApp / Viber
          </div>
          <div style={{padding:"10px 11px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg, #4a5568, #2d3748)",display:"flex",alignItems:"center",justifyContent:"center",color:"#ffffff",fontWeight:800,fontSize:13}}>M</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:"#f7fafc"}}>Manish</div>
              <div style={{fontSize:10,color:"#a0aec0",fontWeight:500}}>🏔 Coder CLI · Rs 699</div>
            </div>
            <span onClick={e=>{e.stopPropagation();setDd(dd==='settings'?null:'settings')}} style={{cursor:"pointer",color:"#718096",fontSize:15}}>⚙</span>
          </div>
        </div>
      </div>
      )}

      {/* ═══ MAIN ═══ */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,zIndex:10,position:"relative"}}>

        {/* ═══ TOP BAR — MODEL SELECTOR PROMINENT ═══ */}
        <div style={{
          padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,
          background:"rgba(26,32,44,0.7)",backdropFilter:"blur(12px)",
          borderBottom:"1px solid rgba(255,255,255,0.06)",gap:8,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setSidebar(!sidebar)} style={{
              width:34,height:34,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",
              background:"rgba(255,255,255,0.04)",cursor:"pointer",fontSize:14,color:"#718096",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>{sidebar?"◀":"☰"}</button>

            {/* ═══ MODEL SELECTOR — BIG & VISIBLE ═══ */}
            <div onClick={e=>{e.stopPropagation();setDd(dd==='model'?null:'model')}} style={{
              padding:"7px 16px",borderRadius:12,cursor:"pointer",
              background: dd==='model' ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
              border:`1px solid ${dd==='model' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
              display:"flex",alignItems:"center",gap:10,transition:"all 0.2s",
              boxShadow: dd==='model' ? "0 0 20px rgba(255,255,255,0.05)" : "none",
            }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.background=dd==='model'?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.05)"}
            >
              <div style={{
                width:26,height:26,borderRadius:8,
                background:"linear-gradient(135deg, #4a5568, #718096)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:13,color:"#ffffff",fontWeight:700,
                boxShadow:"0 2px 8px rgba(0,0,0,0.3)",
              }}>{model.icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#ffffff",lineHeight:1.2}}>{model.name}</div>
                <div style={{fontSize:10,color:"#718096"}}>{model.desc}</div>
              </div>
              <svg width="10" height="6" style={{marginLeft:4,color:"#718096"}}><path d="M0 0 L5 6 L10 0" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
            </div>

            {/* Persona */}
            <div onClick={e=>{e.stopPropagation();setDd(dd==='persona'?null:'persona')}} style={{
              padding:"7px 12px",borderRadius:10,cursor:"pointer",
              background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
              display:"flex",alignItems:"center",gap:6,transition:"all 0.2s",
            }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
            >
              <span style={{fontSize:14}}>{persona.icon}</span>
              <span style={{fontSize:12,color:"#a0aec0"}}>{persona.name}</span>
              <svg width="8" height="5" style={{color:"#4a5568"}}><path d="M0 0 L4 5 L8 0" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
            </div>
          </div>

          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button style={{
              padding:"7px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",
              background:"rgba(255,255,255,0.04)",cursor:"pointer",fontSize:11,fontWeight:500,
              color:"#718096",fontFamily:"inherit",
            }}>📖 Docs</button>
            <button style={{
              padding:"7px 16px",borderRadius:10,border:"none",
              background:"linear-gradient(135deg, #4a5568, #2d3748)",
              boxShadow:"0 4px 14px rgba(0,0,0,0.3)",
              cursor:"pointer",fontSize:11,fontWeight:700,color:"#ffffff",fontFamily:"inherit",
            }}>🏔 Upgrade</button>
          </div>
        </div>

        {/* ═══ MODEL DROPDOWN ═══ */}
        {dd==='model' && (
          <div onClick={e=>e.stopPropagation()} style={{
            position:"absolute",top:56,left:sidebar?52:52,zIndex:100,
            background:"rgba(26,32,44,0.98)",backdropFilter:"blur(20px)",
            borderRadius:16,padding:8,width:300,
            border:"1px solid rgba(255,255,255,0.1)",
            boxShadow:"0 12px 40px rgba(0,0,0,0.5)",
          }}>
            <div style={{padding:"8px 12px 6px",fontSize:10,fontWeight:700,color:"#718096",letterSpacing:1.5,textTransform:"uppercase",display:"flex",alignItems:"center",gap:6}}>
              <span style={{color:"#ffffff"}}>⚡</span> Select AI Model
            </div>
            {MODELS.map(m=>(
              <div key={m.id} onClick={()=>{setModel(m);setDd(null)}}
                style={{
                  padding:"10px 12px",borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:12,
                  background:m.id===model.id?"rgba(255,255,255,0.08)":"transparent",
                  borderLeft:m.id===model.id?"3px solid #ffffff":"3px solid transparent",
                  transition:"all 0.15s",
                }}
                onMouseEnter={e=>{if(m.id!==model.id)e.currentTarget.style.background="rgba(255,255,255,0.04)"}}
                onMouseLeave={e=>{if(m.id!==model.id)e.currentTarget.style.background="transparent"}}
              >
                <div style={{
                  width:34,height:34,borderRadius:10,
                  background:`rgba(${m.tag==='FREE'?'56,189,248':'167,139,250'},0.1)`,
                  border:`1px solid rgba(${m.tag==='FREE'?'56,189,248':'167,139,250'},0.2)`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
                  color:m.color,flexShrink:0,
                }}>{m.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:m.id===model.id?"#ffffff":"#e2e8f0"}}>{m.name}</div>
                  <div style={{fontSize:10,color:"#718096"}}>{m.desc}</div>
                </div>
                {m.tag && <span style={{
                  fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:6,
                  background:m.tag==="FREE"?"rgba(52,211,153,0.1)":"rgba(167,139,250,0.1)",
                  color:m.tag==="FREE"?"#34d399":"#a78bfa",
                  border:`1px solid ${m.tag==="FREE"?"rgba(52,211,153,0.2)":"rgba(167,139,250,0.2)"}`,
                }}>{m.tag}</span>}
                {m.id===model.id && <span style={{color:"#ffffff",fontSize:16}}>✓</span>}
              </div>
            ))}
            <div style={{margin:"6px 12px",padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",fontSize:10,color:"#a0aec0",lineHeight:1.5}}>
              <strong style={{color:"#ffffff"}}>Auto mode:</strong> NepkAI routes simple queries to free models, complex tasks to Claude. Saves up to 90% API costs.
            </div>
          </div>
        )}

        {/* ═══ PERSONA DROPDOWN ═══ */}
        {dd==='persona' && (
          <div onClick={e=>e.stopPropagation()} style={{
            position:"absolute",top:56,left:sidebar?310:250,zIndex:100,
            background:"rgba(26,32,44,0.98)",backdropFilter:"blur(20px)",
            borderRadius:14,padding:8,width:220,
            border:"1px solid rgba(255,255,255,0.1)",
            boxShadow:"0 12px 40px rgba(0,0,0,0.4)",
          }}>
            <div style={{padding:"6px 10px",fontSize:10,fontWeight:700,color:"#718096",letterSpacing:1.5,textTransform:"uppercase"}}>Persona</div>
            {PERSONAS.map(p=>(
              <div key={p.id} onClick={()=>{setPersona(p);setDd(null)}}
                style={{
                  padding:"9px 10px",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10,
                  background:p.id===persona.id?"rgba(255,255,255,0.08)":"transparent",
                }}
                onMouseEnter={e=>{if(p.id!==persona.id)e.currentTarget.style.background="rgba(255,255,255,0.04)"}}
                onMouseLeave={e=>{if(p.id!==persona.id)e.currentTarget.style.background=p.id===persona.id?"rgba(255,255,255,0.08)":"transparent"}}
              >
                <span style={{fontSize:16}}>{p.icon}</span>
                <span style={{fontSize:13,fontWeight:p.id===persona.id?600:400,color:p.id===persona.id?"#ffffff":"#a0aec0"}}>{p.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* ═══ CONNECT MODAL ═══ */}
        {dd==='connect' && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}} onClick={()=>setDd(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"rgba(26,32,44,0.98)",backdropFilter:"blur(20px)",borderRadius:20,padding:28,width:400,maxWidth:"90vw",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                <h3 style={{fontSize:18,fontWeight:700,color:"#ffffff"}}>📱 Connect Platforms</h3>
                <span onClick={()=>setDd(null)} style={{cursor:"pointer",color:"#718096",fontSize:18}}>✕</span>
              </div>
              {[{icon:"💬",name:"WhatsApp",desc:"Chat with NepkAI",action:"+977-98XXXXXXXX",color:"#25d366",ok:true},
                {icon:"📲",name:"Viber",desc:"Coming soon",action:"Notify me",color:"#7360f2",ok:false},
                {icon:"⌨",name:"CLI Terminal",desc:"Code in terminal",action:"npm install -g nepkai",color:"#a0aec0",ok:true,mono:true}
              ].map((p,i)=>(
                <div key={i} style={{padding:14,borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:22}}>{p.icon}</span>
                    <div><div style={{fontSize:14,fontWeight:600,color:"#f7fafc"}}>{p.name}</div><div style={{fontSize:11,color:"#718096"}}>{p.desc}</div></div>
                  </div>
                  <div style={{padding:"7px 12px",borderRadius:8,background:`${p.color}15`,border:`1px solid ${p.color}30`,fontSize:12,fontWeight:600,textAlign:"center",color:p.color,fontFamily:p.mono?"'JetBrains Mono',monospace":"inherit"}}>{p.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SETTINGS MODAL ═══ */}
        {dd==='settings' && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}} onClick={()=>setDd(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"rgba(26,32,44,0.98)",backdropFilter:"blur(20px)",borderRadius:20,padding:28,width:400,maxWidth:"90vw",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                <h3 style={{fontSize:18,fontWeight:700,color:"#ffffff"}}>⚙ Settings</h3>
                <span onClick={()=>setDd(null)} style={{cursor:"pointer",color:"#718096"}}>✕</span>
              </div>
              <div style={{padding:14,borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",marginBottom:12}}>
                <div style={{fontSize:10,color:"#718096",fontWeight:600,letterSpacing:1,marginBottom:8}}>PLAN</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><span style={{fontSize:15,fontWeight:700,color:"#ffffff"}}>🏔 Coder CLI</span><span style={{fontSize:12,color:"#718096",marginLeft:8}}>Rs 699/mo</span></div>
                  <button style={{padding:"5px 14px",borderRadius:8,border:"none",background:"linear-gradient(135deg, #4a5568, #2d3748)",color:"#ffffff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Upgrade</button>
                </div>
              </div>
              <div style={{padding:14,borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",marginBottom:12}}>
                <div style={{fontSize:10,color:"#718096",fontWeight:600,letterSpacing:1,marginBottom:12}}>USAGE</div>
                {[{label:"CLI Interactions",used:45,total:200,color:"#a0aec0"},{label:"Claude Haiku",used:8,total:30,color:"#38bdf8"},{label:"Claude Sonnet",used:2,total:10,color:"#f472b6"}].map((u,i)=>(
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                      <span style={{color:"#a0aec0"}}>{u.label}</span>
                      <span style={{color:"#718096",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{u.used}/{u.total}</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(u.used/u.total)*100}%`,borderRadius:3,background:`linear-gradient(90deg, ${u.color}, ${u.color}88)`,transition:"width 0.5s"}}/>
                    </div>
                  </div>
                ))}
                <div style={{fontSize:10,color:"#4a5568",marginTop:4}}>Resets in 15 days</div>
              </div>
              <div style={{padding:14,borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{fontSize:10,color:"#718096",fontWeight:600,letterSpacing:1,marginBottom:10}}>PAYMENT</div>
                <div style={{display:"flex",gap:8}}>
                  {["eSewa","Khalti","Bank"].map((p,i)=>(
                    <div key={p} style={{flex:1,padding:8,borderRadius:8,textAlign:"center",fontSize:12,fontWeight:500,cursor:"pointer",
                      background:i===0?"rgba(52,211,153,0.08)":"rgba(255,255,255,0.03)",
                      border:i===0?"1px solid rgba(52,211,153,0.2)":"1px solid rgba(255,255,255,0.06)",
                      color:i===0?"#34d399":"#718096",
                    }}>{i===0?"✓ ":""}{p}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CHAT AREA ═══ */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 0"}} onClick={()=>setDd(null)}>
          {(!activeId||msgs.length===0) ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:20}}>

              {/* ═══ SHINING NEPKAI LOGO ═══ */}
              <div style={{position:"relative",marginBottom:6}}>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:300,height:110,borderRadius:"50%",
                  background:"radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, rgba(160,174,192,0.05) 60%, transparent 100%)",
                  filter:"blur(25px)",animation:"glow 3s ease-in-out infinite alternate",
                }}/>
                <h1 style={{
                  fontSize:72,fontWeight:900,letterSpacing:-4,position:"relative",
                  background:"linear-gradient(135deg, #ffffff 0%, #e2e8f0 15%, #a0aec0 30%, #ffffff 45%, #718096 55%, #e2e8f0 70%, #ffffff 82%, #a0aec0 100%)",
                  backgroundSize:"300% 300%",
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                  animation:"shine 4s ease-in-out infinite",
                  filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  userSelect:"none",
                }}>NEPKAI</h1>
              </div>
              <p style={{fontSize:12,color:"#a0aec0",fontWeight:600,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Nepal ko AI</p>
              <p style={{fontSize:15,color:"#718096",marginBottom:6}}>
                From the top of the world — <span style={{color:"#ffffff",fontFamily:"'Noto Sans Devanagari',sans-serif"}}>नेपालको आफ्नै AI</span>
              </p>
              <p style={{fontSize:11,color:"#4a5568",marginBottom:36}}>Gemini · Claude · Groq · Codestral — smart routing picks the best</p>

              {/* Suggestions */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,maxWidth:520,width:"100%"}}>
                {[
                  {icon:"📄",title:"निवेदन बनाउनुस्",desc:"Application letter PDF in 30 sec",q:"निवेदन बनाइदिनुस् — वडा कार्यालयमा",accent:"#38bdf8"},
                  {icon:"⌨",title:"Code with AI",desc:"Write, debug & deploy",q:"Build a REST API with Express.js and JWT",accent:"#60a5fa"},
                  {icon:"📚",title:"लोकसेवा तयारी",desc:"GK quiz with score tracking",q:"लोकसेवा सामान्य ज्ञान quiz — ५ प्रश्न",accent:"#a0aec0"},
                  {icon:"📋",title:"CV Builder",desc:"Professional resume PDF",q:"Create a professional CV for Full Stack Dev",accent:"#f472b6"},
                ].map((s,i)=>(
                  <div key={i} onClick={()=>{if(!activeId)newChat();setTimeout(()=>setInput(s.q),60)}}
                    style={{
                      padding:"16px 15px",borderRadius:16,cursor:"pointer",textAlign:"left",
                      background:"rgba(255,255,255,0.03)",
                      border:"1px solid rgba(255,255,255,0.06)",
                      transition:"all 0.25s",
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.3)"}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}
                  >
                    <div style={{width:34,height:34,borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,marginBottom:10}}>{s.icon}</div>
                    <div style={{fontSize:14,fontWeight:600,color:"#f7fafc",marginBottom:3}}>{s.title}</div>
                    <div style={{fontSize:11,color:"#718096"}}>{s.desc}</div>
                  </div>
                ))}
              </div>

              {/* Feature Pills */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginTop:24}}>
                {["📄 Documents","⌨ CLI","📚 Loksewa","📋 CV","🏠 Agreements","🔌 API"].map((p,i)=>(
                  <div key={i} style={{
                    padding:"5px 13px",borderRadius:20,fontSize:11,color:"#718096",cursor:"pointer",fontWeight:500,
                    background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",transition:"all 0.2s",
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.color="#ffffff";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"}}
                    onMouseLeave={e=>{e.currentTarget.style.color="#718096";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}}
                  >{p}</div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{maxWidth:700,margin:"0 auto",padding:"0 20px"}}>
              {msgs.map((m,i)=>(
                <div key={i} style={{display:"flex",gap:12,marginBottom:20,flexDirection:m.role==="user"?"row-reverse":"row"}}>
                  {m.role==="ai"&&(
                    <div style={{width:32,height:32,borderRadius:10,flexShrink:0,background:"linear-gradient(135deg, #4a5568, #2d3748)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
                      <span style={{color:"#ffffff",fontWeight:900,fontSize:12}}>N</span>
                    </div>
                  )}
                  <div style={{
                    maxWidth:"72%",padding:"13px 17px",
                    borderRadius:m.role==="user"?"18px 18px 6px 18px":"6px 18px 18px 18px",
                    background:m.role==="user"?"linear-gradient(135deg, #4a5568, #2d3748)":"rgba(255,255,255,0.04)",
                    border:m.role==="user"?"none":"1px solid rgba(255,255,255,0.06)",
                    boxShadow:m.role==="user"?"0 4px 16px rgba(0,0,0,0.3)":"none",
                    color:m.role==="user"?"#ffffff":"#e2e8f0",fontSize:14,lineHeight:1.7,
                    fontWeight:m.role==="user"?500:400,
                  }} dangerouslySetInnerHTML={{__html:m.role==="user"?m.content.replace(/\n/g,'<br/>'):md(m.content)}}/>
                  {m.role==="ai"&&m.model&&(
                    <div style={{alignSelf:"flex-end",fontSize:9,color:"#4a5568"}}>
                      {MODELS.find(x=>x.id===m.model)?.name||m.model}
                    </div>
                  )}
                </div>
              ))}
              {typing&&(
                <div style={{display:"flex",gap:12,marginBottom:20}}>
                  <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg, #4a5568, #2d3748)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
                    <span style={{color:"#ffffff",fontWeight:900,fontSize:12}}>N</span>
                  </div>
                  <div style={{padding:"14px 20px",borderRadius:"6px 18px 18px 18px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:5}}>
                    {[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:"50%",background:"#ffffff",animation:`bounce 1.2s infinite ${j*0.2}s`}}/>)}
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>
          )}
        </div>

        {/* ═══ INPUT ═══ */}
        <div style={{padding:"0 20px 18px",flexShrink:0}}>
          <div style={{maxWidth:700,margin:"0 auto"}}>
            <div style={{
              display:"flex",alignItems:"flex-end",borderRadius:18,padding:4,
              background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.08)",
              boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
              transition:"all 0.2s",
            }}
              onFocus={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"}
              onBlur={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}
            >
              <textarea value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                rows={1} placeholder="NepkAI लाई सोध्नुहोस्... Ask anything... 🏔"
                style={{
                  flex:1,background:"none",border:"none",outline:"none",
                  color:"#f7fafc",fontFamily:"Outfit, 'Noto Sans Devanagari', sans-serif",
                  fontSize:15,lineHeight:1.5,padding:"10px 14px",resize:"none",minHeight:24,maxHeight:180,
                }}
              />
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 6px 4px 0"}}>
                <button style={{width:34,height:34,borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.04)",cursor:"pointer",fontSize:14,color:"#718096",display:"flex",alignItems:"center",justifyContent:"center"}}>📎</button>
                <button style={{width:34,height:34,borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.04)",cursor:"pointer",fontSize:14,color:"#718096",display:"flex",alignItems:"center",justifyContent:"center"}}>🎤</button>
                <button onClick={send} style={{
                  width:36,height:36,borderRadius:11,border:"none",
                  background:input.trim()?"linear-gradient(135deg, #4a5568, #2d3748)":"rgba(255,255,255,0.06)",
                  boxShadow:input.trim()?"0 4px 14px rgba(0,0,0,0.3)":"none",
                  color:input.trim()?"#ffffff":"#4a5568",cursor:input.trim()?"pointer":"default",
                  fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,transition:"all 0.2s",
                }}>↑</button>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:8,fontSize:10,color:"#4a5568",alignItems:"center"}}>
              <span>🏔 {model.name}</span>
              <span>·</span>
              <span>🔒 Encrypted</span>
              <span>·</span>
              <span>💳 eSewa / Khalti</span>
              <span>·</span>
              <img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fmasukojhol.github.io%2Fnepkai-himalayan&count_bg=%23FFFFFF&title_bg=%232d3748&icon=&icon_color=%23FFFFFF&title=visitors&edge_flat=true" alt="visitors" style={{height:16,opacity:0.7}}/>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ANIMATIONS ═══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
        @keyframes shine{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes glow{0%{opacity:.3;transform:translate(-50%,-50%) scale(.9)}100%{opacity:.8;transform:translate(-50%,-50%) scale(1.15)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes twinkle{0%,100%{opacity:.2}50%{opacity:1}}
        *::-webkit-scrollbar{width:5px}
        *::-webkit-scrollbar-track{background:transparent}
        *::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
        *::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.2)}
        ::selection{background:rgba(255,255,255,0.15)}
        textarea::placeholder{color:#4a5568}
      `}</style>
    </div>
  );
}
