import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════
// 시즌 데이터
// ══════════════════════════════════════════
const SEASON_DATA = {
  spring: {
    ko:"봄 웜톤", en:"Spring Warm", emoji:"🌸",
    gradient:"linear-gradient(135deg,#FFF0E8,#FFD8C0)",
    accent:"#C45C30", light:"#FFF5EE", chip:"#FFE8D8",
    desc:"맑고 따뜻한 빛을 가진 봄 웜톤입니다. 밝고 생기 있는 파스텔 컬러가 잘 어울려요.",
    keywords:["로맨틱","프리티","발랄한","투명한"],
    best:["#F9C6BC","#F4A896","#FAD6A0","#F9EB9A","#C8ECA4","#A8DCEE"],
    worst:["#4a4a6a","#2a2a2a","#808080","#7B3FA0"],
    makeup:{lip:"#E87858",blush:"#F4A898",shadow:"#F4CC90"},
    hair:["#D4A060","#E87848","#F0C0A8"], hairNames:["Honey Blonde","Coral Orange","Light Peach"],
    style:["플로럴 패턴","파스텔톤","페미닌핏","쉬폰·린넨"],
    jewelry:["골드","로즈골드","샴페인골드"], eyewear:["골드 메탈","베이지 프레임","코랄 핑크"],
  },
  summer: {
    ko:"여름 쿨톤", en:"Summer Cool", emoji:"🌊",
    gradient:"linear-gradient(135deg,#EEF4FF,#D0DEFF)",
    accent:"#3A6BAA", light:"#EFF5FF", chip:"#D8E8FF",
    desc:"부드럽고 차가운 여름 쿨톤입니다. 소프트한 쿨톤 컬러로 엘레강스한 이미지를 완성해요.",
    keywords:["엘레강스","소피스티케이티드","소프트","세련된"],
    best:["#E8D0F0","#D0B8E8","#C8D8F8","#A8C4F0","#F0C8D8","#B0D8E8"],
    worst:["#C87820","#8B5E20","#D4A060","#E8A040"],
    makeup:{lip:"#D890A8",blush:"#E8A8C0",shadow:"#D8C0E8"},
    hair:["#B8A8C8","#C0B0D0","#A898B8"], hairNames:["Ash Brown","Lavender Ash","Cool Brown"],
    style:["소프트 드레이프","라벤더 톤","실크·시폰","엘레강스 핏"],
    jewelry:["실버","화이트골드","플래티넘"], eyewear:["쿨 실버","라벤더 프레임","쿨 그레이"],
  },
  autumn: {
    ko:"가을 웜톤", en:"Autumn Warm", emoji:"🍂",
    gradient:"linear-gradient(135deg,#FFF4E0,#FFD890)",
    accent:"#8B5E20", light:"#FFF8EE", chip:"#FFE8C0",
    desc:"깊고 따뜻한 가을 웜톤입니다. 어스톤 컬러로 클래식하고 성숙한 이미지를 완성해요.",
    keywords:["클래식","내추럴","성숙한","깊이 있는"],
    best:["#D4A060","#C88840","#B87030","#E8C080","#C0A860","#D8B870"],
    worst:["#D0E8F8","#E8D0F0","#B4C8F0","#C8E0F8"],
    makeup:{lip:"#B06030",blush:"#D09060",shadow:"#D4A870"},
    hair:["#8B5E20","#A07030","#C08840"], hairNames:["Dark Brown","Chestnut","Caramel"],
    style:["어스톤","트위드·울","카멜 코트","클래식 핏"],
    jewelry:["골드","앤틱골드","브론즈"], eyewear:["다크 브라운","카멜 프레임","토이쉘"],
  },
  winter: {
    ko:"겨울 쿨톤", en:"Winter Cool", emoji:"❄️",
    gradient:"linear-gradient(135deg,#EEF0FF,#D0D8FF)",
    accent:"#2D4880", light:"#EEF2FF", chip:"#D8E0FF",
    desc:"선명하고 차가운 겨울 쿨톤입니다. 강렬하고 시크한 컬러로 모던한 이미지를 완성해요.",
    keywords:["시크","모던","강렬한","도시적인"],
    best:["#2040A0","#4060C0","#C02040","#A01030","#8090C8","#1a1a2a"],
    worst:["#F0D8C0","#E8C898","#D4A860","#FAD6A0"],
    makeup:{lip:"#A01030",blush:"#C02040",shadow:"#A0A8C8"},
    hair:["#1a1a2a","#303048","#808098"], hairNames:["Blue Black","Dark Navy","Ash Gray"],
    style:["블랙&화이트","미니멀","스트럭처드","샤프한 라인"],
    jewelry:["실버","플래티넘","화이트골드"], eyewear:["블랙 프레임","쿨 실버","다크 네이비"],
  },
};
const SUBTYPES = {
  spring:["라이트","브라이트","웜","클리어"],
  summer:["라이트","뮤트","쿨","소프트"],
  autumn:["뮤트","딥","웜","스트롱"],
  winter:["브라이트","딥","쿨","클리어"],
};

// ══════════════════════════════════════════
// 스토리지 헬퍼 (shared:true → 모든 사용자 공유)
// ══════════════════════════════════════════
// ── Google Sheets 연동 ──────────────────────
// Apps Script 배포 후 아래 URL을 교체해주세요
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyo2AHwS3un5IThnnUIXeUgFo7dp_ZA3vIq5RAZ6wWtMHR9qQs43ZE46cUK6A6m_ZA/exec";

async function saveRecord(record) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "save", record }),
    });
    const data = await res.json();
    return data.success;
  } catch { return false; }
}

async function loadAllRecords() {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getAll`);
    const data = await res.json();
    return data.success ? data.records : [];
  } catch { return []; }
}

async function findRecord(code) {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=find&code=${code.trim().toUpperCase()}`);
    const data = await res.json();
    return data.success ? data.record : null;
  } catch { return null; }
}

async function deleteRecord(code) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "delete", code }),
    });
    const data = await res.json();
    return data.success;
  } catch { return false; }
}
function genCode() { return "PC" + Date.now().toString(36).toUpperCase().slice(-6); }

// ══════════════════════════════════════════
// PDF 생성 (html2canvas 없이 순수 HTML print)
// ══════════════════════════════════════════
function downloadPDF(record) {
  const S = SEASON_DATA[record.season];
  const sw = (bg, extra="") => `display:inline-block;width:38px;height:38px;border-radius:8px;background-color:${bg} !important;border:1px solid rgba(0,0,0,0.08);${extra}`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    *{ box-sizing:border-box; margin:0; padding:0;
       -webkit-print-color-adjust:exact !important;
       print-color-adjust:exact !important;
       color-adjust:exact !important; }
    body{ font-family:'Noto Sans KR',sans-serif; background:#ffffff; color:#1a2744; padding:28px; max-width:700px; margin:0 auto; }
    .cover{ background-image:${S.gradient}; border-radius:16px; padding:32px 24px; text-align:center; margin-bottom:24px; }
    .cover-tag{ font-size:10px; letter-spacing:2px; color:${S.accent}; font-weight:700; margin-bottom:8px; }
    .cover-name{ font-size:15px; color:${S.accent}; margin-bottom:4px; }
    .cover-season{ font-size:26px; font-weight:800; color:#1a2744; margin-bottom:4px; }
    .cover-en{ font-size:13px; color:${S.accent}; margin-bottom:14px; }
    .chip{ background-color:rgba(255,255,255,0.75) !important; color:${S.accent}; border:1px solid ${S.accent}; border-radius:20px; padding:4px 12px; font-size:11px; font-weight:600; display:inline-block; margin:3px; }
    .section{ margin-bottom:22px; }
    .sec-title{ font-size:9px; letter-spacing:2px; text-transform:uppercase; color:${S.accent}; font-weight:700; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid ${S.accent}; }
    .palette{ display:flex; gap:6px; flex-wrap:wrap; }
    .tag{ background-color:${S.chip} !important; color:${S.accent}; border:1px solid ${S.accent}; border-radius:20px; padding:5px 13px; font-size:11px; font-weight:600; display:inline-block; margin:3px; }
    .desc{ font-size:12px; line-height:1.85; color:#444; background-color:${S.light} !important; padding:12px 14px; border-radius:10px; margin-top:8px; }
    .makeup-row{ display:flex; gap:20px; flex-wrap:wrap; }
    .makeup-label{ font-size:10px; color:#888; margin-bottom:5px; }
    .makeup-swatches{ display:flex; gap:5px; }
    .footer{ text-align:center; margin-top:28px; padding:16px; background-color:${S.chip} !important; border-radius:12px; font-size:11px; color:${S.accent}; line-height:1.8; }
    .date-info{ font-size:11px; color:#888; margin-top:12px; }
    @page{ margin:12mm; }
    @media print{
      *{ -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; color-adjust:exact !important; }
    }
  </style></head><body>
  <div class="cover">
    <div class="cover-tag">PERSONAL COLOR DIAGNOSIS · 컬러인에듀센터</div>
    <div class="cover-name">${record.name}님의 진단 결과</div>
    <div class="cover-season">${S.ko} · ${record.subtype}</div>
    <div class="cover-en">${S.en}</div>
    <div>${S.keywords.map(k=>`<span class="chip">${k}</span>`).join("")}</div>
    <div class="date-info">진단일: ${record.date}</div>
  </div>

  <div class="section">
    <div class="sec-title">Best Colors · 베스트 컬러</div>
    <div class="palette">${S.best.map(c=>`<span style="${sw(c)}"></span>`).join("")}</div>
  </div>

  <div class="section">
    <div class="sec-title">Avoid Colors · 피해야 할 컬러</div>
    <div class="palette">${S.worst.map(c=>`<span style="${sw(c,"display:inline-flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.9);font-size:14px;")}">✕</span>`).join("")}</div>
  </div>

  <div class="section">
    <div class="sec-title">Makeup · 메이크업</div>
    <div class="makeup-row">
      <div><div class="makeup-label">💋 립 &amp; 블러셔</div><div class="makeup-swatches"><span style="${sw(S.makeup.lip)}"></span><span style="${sw(S.makeup.blush)}"></span></div></div>
      <div><div class="makeup-label">👁 아이섀도</div><div class="makeup-swatches"><span style="${sw(S.makeup.shadow)}"></span><span style="${sw(S.best[2])}"></span><span style="${sw(S.best[3])}"></span></div></div>
      <div><div class="makeup-label">💇 헤어</div><div class="makeup-swatches">${S.hair.map(c=>`<span style="${sw(c)}"></span>`).join("")}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="sec-title">Fashion Style · 패션 스타일</div>
    <div>${S.style.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
    <div class="desc">${S.desc}</div>
  </div>

  <div class="section">
    <div class="sec-title">Jewelry &amp; Eyewear · 주얼리 &amp; 안경</div>
    <div>${S.jewelry.map(j=>`<span class="tag">${j}</span>`).join("")}
    ${S.eyewear.map(e=>`<span style="background-color:#f0f0f0 !important;color:#555;border:1px solid #ddd;border-radius:20px;padding:5px 13px;font-size:11px;display:inline-block;margin:3px;">${e}</span>`).join("")}</div>
  </div>

  ${record.memo?`<div class="section"><div class="sec-title">강사 메모</div><div class="desc">${record.memo}</div></div>`:""}

  <div class="footer">
    컬러인에듀센터 · Color In Story<br>
    📞 063-221-2802 · 010-3443-2802<br>
    📍 전북 전주시 홍산남로51 프렌즈빌딩 8층<br>
    본 진단 결과는 전문가 대면 진단을 기반으로 작성되었습니다.
  </div>

  <script>
    window.onload = () => {
      setTimeout(() => window.print(), 800);
    };
  </script>
  </body></html>`;
  const blob = new Blob([html], { type:"text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    const a = document.createElement("a");
    a.href = url; a.download = `${record.name}_퍼스널컬러_${record.season}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ══════════════════════════════════════════
// 카카오 공유
// ══════════════════════════════════════════
function shareKakao(record) {
  const S = SEASON_DATA[record.season];
  const text = `🎨 ${record.name}님의 퍼스널컬러 진단 결과\n\n${S.emoji} ${S.ko} · ${record.subtype}\n키워드: ${S.keywords.join(", ")}\n\n📋 결과 조회 코드: ${record.code}\n컬러인에듀센터 앱에서 코드를 입력하면 상세 결과를 확인하실 수 있습니다.\n\n📞 063-221-2802`;
  if (navigator.share) {
    navigator.share({ title: "퍼스널컬러 진단 결과", text });
  } else {
    navigator.clipboard?.writeText(text).catch(()=>{});
    alert("결과 내용이 복사되었습니다!\n카카오톡에 붙여넣기 해주세요 😊");
  }
}

// ══════════════════════════════════════════
// 공통 컴포넌트
// ══════════════════════════════════════════
function Btn({ children, onClick, variant="dark", style={} }) {
  const v = {
    dark:{background:"#1a2744",color:"#fff",boxShadow:"0 4px 16px rgba(26,39,68,0.2)"},
    light:{background:"rgba(255,255,255,0.85)",color:"#1a2744",border:"0.5px solid rgba(0,0,0,0.1)"},
    green:{background:"#25D366",color:"#fff"},
    danger:{background:"#fff0f0",color:"#cc0000",border:"0.5px solid #ffcccc"},
  };
  return <button onClick={onClick} style={{border:"none",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s",width:"100%",...v[variant],...style}}>{children}</button>;
}
function Card({ children, style={} }) {
  return <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(12px)",borderRadius:16,padding:"18px",marginBottom:12,boxShadow:"0 2px 16px rgba(0,0,0,0.06)",border:"0.5px solid rgba(0,0,0,0.06)",...style}}>{children}</div>;
}
function SecTitle({ accent, children }) {
  return <div style={{fontSize:10,letterSpacing:2,color:accent,fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>{children}<div style={{flex:1,height:0.5,background:accent,opacity:0.2}}/></div>;
}
function Tag({ children, accent, chip }) {
  return <span style={{background:chip,color:accent,border:`0.5px solid ${accent}40`,borderRadius:20,padding:"5px 13px",fontSize:11,fontWeight:600}}>{children}</span>;
}

// ══════════════════════════════════════════
// 메인 앱
// ══════════════════════════════════════════
export default function App() {
  const [mode, setMode] = useState("home");
  const [adminAuth, setAdminAuth] = useState(false);
  const [anim, setAnim] = useState(true);
  const go = (next) => { setAnim(false); setTimeout(()=>{setMode(next);setAnim(true);},180); };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#FFF8F5 0%,#FFE8D8 60%,#FFD0B8 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Noto Sans KR',sans-serif"}}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
      <div style={{width:"100%",maxWidth:440,opacity:anim?1:0,transform:anim?"translateY(0)":"translateY(10px)",transition:"all 0.25s ease"}}>

        {mode==="home" && <Home onAdmin={()=>go("admin")} onCustomer={()=>go("customer")}/>}
        {mode==="admin" && (adminAuth
          ? <AdminPanel onLogout={()=>{setAdminAuth(false);go("home");}}/>
          : <AdminLogin onSuccess={()=>setAdminAuth(true)} onBack={()=>go("home")}/>
        )}
        {mode==="customer" && <CustomerLookup onBack={()=>go("home")}/>}

      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// 홈
// ══════════════════════════════════════════
function Home({ onAdmin, onCustomer }) {
  return (
    <div style={{textAlign:"center"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:"conic-gradient(#F9C6BC,#FAD6A0,#C8ECA4,#A8DCEE,#B4C8F0,#F9C6BC)",margin:"0 auto 20px",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",animation:"spin 10s linear infinite"}}/>
      <div style={{fontSize:10,letterSpacing:3,color:"#C45C30",marginBottom:6,fontWeight:700}}>COLOR IN STORY</div>
      <h1 style={{fontSize:26,fontWeight:800,color:"#1a2744",marginBottom:6,lineHeight:1.2}}>퍼스널컬러<br/>진단 시스템</h1>
      <p style={{fontSize:12,color:"#8C6040",marginBottom:32,lineHeight:1.7}}>컬러인에듀센터 전용 플랫폼<br/>강사 관리자 · 고객 결과 조회</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        {Object.values(SEASON_DATA).map(s=>(
          <div key={s.en} style={{background:s.chip,borderRadius:12,padding:"10px 14px",border:`0.5px solid ${s.accent}30`,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>{s.emoji}</span>
            <div><div style={{fontSize:11,fontWeight:700,color:"#1a2744"}}>{s.ko}</div><div style={{fontSize:9,color:s.accent}}>{s.en}</div></div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>
        <Btn onClick={onAdmin}>🔐 강사 관리자 로그인</Btn>
        <Btn variant="light" onClick={onCustomer}>🎨 고객 결과 조회</Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// 관리자 로그인
// ══════════════════════════════════════════
function AdminLogin({ onSuccess, onBack }) {
  const [pw, setPw] = useState("");
  const login = () => { if(pw==="color1234") onSuccess(); else alert("비밀번호가 틀렸습니다."); };
  return (
    <Card>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:36,marginBottom:8}}>🔐</div>
        <h2 style={{fontSize:18,fontWeight:700,color:"#1a2744"}}>강사 관리자</h2>
        <p style={{fontSize:11,color:"#bbb",marginTop:4}}>센터 전용 비밀번호를 입력해주세요</p>
      </div>
      <input type="password" placeholder="비밀번호 입력" value={pw}
        onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
        style={{width:"100%",padding:"12px 14px",borderRadius:10,marginBottom:10,border:"0.5px solid #ddd",fontSize:14,outline:"none",fontFamily:"'Noto Sans KR',sans-serif"}}/>
      <Btn onClick={login}>로그인</Btn>
      <Btn variant="light" onClick={onBack} style={{marginTop:8}}>← 돌아가기</Btn>
    </Card>
  );
}

// ══════════════════════════════════════════
// 관리자 패널
// ══════════════════════════════════════════
function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState("new");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  // 폼
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [season, setSeason] = useState("");
  const [subtype, setSubtype] = useState("");
  const [memo, setMemo] = useState("");
  const [photo, setPhoto] = useState(null); // base64
  const fileRef = useRef();

  useEffect(()=>{ if(tab==="list") loadAllRecords().then(setRecords); },[tab]);

  const resetForm = () => { setName("");setPhone("");setSeason("");setSubtype("");setMemo("");setPhoto(null);setEditTarget(null); };

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if(!name||!season||!subtype){alert("이름, 시즌, 세부타입을 입력해주세요.");return;}
    setLoading(true);
    const code = editTarget?.code || genCode();
    const record = { code, name, phone, date, season, subtype, memo, photo, createdAt: Date.now(), history:editTarget?.history||[] };
    // 재진단이면 이력 추가
    if(editTarget) {
      record.history = [...(editTarget.history||[]), { season:editTarget.season, subtype:editTarget.subtype, date:editTarget.date, memo:editTarget.memo }];
    }
    await saveRecord(record);
    setGenerated(record);
    resetForm();
    setLoading(false);
  };

  const handleEdit = (r) => {
    setEditTarget(r); setName(r.name); setPhone(r.phone||"");
    setDate(new Date().toISOString().slice(0,10));
    setSeason(""); setSubtype(""); setMemo(""); setPhoto(r.photo||null);
    setTab("new");
  };

  const handleDelete = async (code) => {
    if(!confirm("삭제하시겠습니까?"))return;
    await deleteRecord(code);
    setRecords(r=>r.filter(x=>x.code!==code));
  };

  const S = season ? SEASON_DATA[season] : null;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div style={{fontSize:10,letterSpacing:2,color:"#C45C30",fontWeight:700}}>ADMIN</div>
          <h2 style={{fontSize:18,fontWeight:800,color:"#1a2744"}}>강사 관리자</h2>
        </div>
        <button onClick={onLogout} style={{background:"none",border:"none",fontSize:12,color:"#999",cursor:"pointer"}}>로그아웃</button>
      </div>

      {/* 통계 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
        {[
          {label:"전체 고객", val: records.length||"—", icon:"👥"},
          {label:"이번달", val: (records.filter(r=>r.date?.slice(0,7)===new Date().toISOString().slice(0,7)).length)||"—", icon:"📅"},
          {label:"재진단", val: (records.filter(r=>r.history?.length>0).length)||"—", icon:"🔄"},
        ].map(s=>(
          <div key={s.label} style={{background:"rgba(255,255,255,0.8)",borderRadius:12,padding:"10px",textAlign:"center"}}>
            <div style={{fontSize:18}}>{s.icon}</div>
            <div style={{fontSize:20,fontWeight:800,color:"#1a2744"}}>{s.val}</div>
            <div style={{fontSize:10,color:"#999"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"new",label:"➕ 새 진단"},{id:"list",label:"📋 고객 목록"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:tab===t.id?"#1a2744":"rgba(255,255,255,0.7)",color:tab===t.id?"#fff":"#8C6040",fontSize:12,fontWeight:600,transition:"all 0.2s"}}>{t.label}</button>
        ))}
      </div>

      {/* 새 진단 */}
      {tab==="new" && (
        generated ? (
          <Card>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:36,marginBottom:8}}>✅</div>
              <h3 style={{fontSize:16,fontWeight:700,color:"#1a2744"}}>{editTarget?"재진단 완료!":"코드 생성 완료!"}</h3>
            </div>
            <div style={{background:"#f0f4ff",borderRadius:10,padding:"14px",textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:11,color:"#666",marginBottom:4}}>고객 전용 코드</div>
              <div style={{fontSize:28,fontWeight:800,color:"#1a2744",letterSpacing:4}}>{generated.code}</div>
            </div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.9,marginBottom:14}}>
              <div>👤 {generated.name}님</div>
              <div>🎨 {SEASON_DATA[generated.season]?.ko} · {generated.subtype}</div>
              <div>📅 {generated.date}</div>
              {generated.history?.length>0 && <div style={{color:"#C45C30"}}>🔄 재진단 {generated.history.length}회 이력 있음</div>}
            </div>
            <Btn onClick={()=>shareKakao(generated)} variant="green" style={{marginBottom:8}}>💬 카카오톡으로 공유</Btn>
            <Btn onClick={()=>downloadPDF(generated)} variant="light" style={{marginBottom:8}}>📄 PDF 다운로드</Btn>
            <Btn variant="light" onClick={()=>setGenerated(null)}>새 고객 입력</Btn>
          </Card>
        ) : (
          <Card>
            <SecTitle accent="#C45C30">{editTarget?`🔄 ${editTarget.name}님 재진단`:"고객 정보 입력"}</SecTitle>
            {editTarget && (
              <div style={{background:"#fff8f0",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:12,color:"#8B5E20"}}>
                이전: {SEASON_DATA[editTarget.season]?.ko} · {editTarget.subtype} ({editTarget.date})
              </div>
            )}
            {/* 고객 사진 업로드 */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:"#8C6040",fontWeight:600,marginBottom:6}}>고객 사진 (선택)</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div onClick={()=>fileRef.current?.click()} style={{width:64,height:64,borderRadius:12,border:"1.5px dashed #ddd",background:"#fafafa",cursor:"pointer",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {photo ? <img src={photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{fontSize:24}}>📷</span>}
                </div>
                <div style={{fontSize:12,color:"#999",lineHeight:1.6}}>사진을 업로드하면<br/>진단 결과에 함께 표시됩니다</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </div>

            {[
              {label:"고객 이름 *",value:name,set:setName,placeholder:"홍길동"},
              {label:"연락처",value:phone,set:setPhone,placeholder:"010-0000-0000"},
              {label:"진단 날짜 *",value:date,set:setDate,type:"date"},
            ].map(f=>(
              <div key={f.label} style={{marginBottom:10}}>
                <div style={{fontSize:11,color:"#8C6040",fontWeight:600,marginBottom:4}}>{f.label}</div>
                <input type={f.type||"text"} value={f.value} placeholder={f.placeholder} onChange={e=>f.set(e.target.value)}
                  style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"0.5px solid #ddd",fontSize:13,outline:"none",fontFamily:"'Noto Sans KR',sans-serif"}}/>
              </div>
            ))}

            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:"#8C6040",fontWeight:600,marginBottom:6}}>시즌 선택 *</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {Object.entries(SEASON_DATA).map(([k,s])=>(
                  <button key={k} onClick={()=>{setSeason(k);setSubtype("");}} style={{padding:"10px 8px",borderRadius:10,cursor:"pointer",border:season===k?`2px solid ${s.accent}`:"0.5px solid #ddd",background:season===k?s.chip:"#fff",display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"}}>
                    <span style={{fontSize:16}}>{s.emoji}</span>
                    <div style={{textAlign:"left"}}><div style={{fontSize:11,fontWeight:600,color:"#1a2744"}}>{s.ko}</div><div style={{fontSize:9,color:s.accent}}>{s.en}</div></div>
                  </button>
                ))}
              </div>
            </div>

            {season && (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,color:"#8C6040",fontWeight:600,marginBottom:6}}>세부 타입 *</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {SUBTYPES[season].map(st=>(
                    <button key={st} onClick={()=>setSubtype(st)} style={{padding:"7px 14px",borderRadius:20,cursor:"pointer",border:subtype===st?`1.5px solid ${S?.accent}`:"0.5px solid #ddd",background:subtype===st?S?.chip:"#fff",fontSize:12,fontWeight:subtype===st?600:400,color:subtype===st?S?.accent:"#666",transition:"all 0.15s"}}>{st}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:"#8C6040",fontWeight:600,marginBottom:4}}>강사 메모</div>
              <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="특이사항, 추가 코멘트..."
                style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"0.5px solid #ddd",fontSize:12,outline:"none",fontFamily:"'Noto Sans KR',sans-serif",resize:"none",height:70}}/>
            </div>

            <Btn onClick={handleGenerate} style={{opacity:loading?0.6:1}}>
              {loading?"생성 중...":(editTarget?"🔄 재진단 코드 업데이트":"🎨 진단 코드 생성")}
            </Btn>
            {editTarget && <Btn variant="light" onClick={resetForm} style={{marginTop:8}}>취소</Btn>}
          </Card>
        )
      )}

      {/* 고객 목록 */}
      {tab==="list" && (
        <div>
          {records.length===0 ? (
            <Card style={{textAlign:"center",padding:"32px"}}>
              <div style={{fontSize:32,marginBottom:8}}>📭</div>
              <p style={{fontSize:13,color:"#999"}}>아직 등록된 고객이 없어요</p>
            </Card>
          ) : records.map(r=>{
            const S2=SEASON_DATA[r.season];
            return (
              <Card key={r.code} style={{padding:"14px 16px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {r.photo
                    ? <img src={r.photo} style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`2px solid ${S2?.accent}40`}}/>
                    : <div style={{width:40,height:40,borderRadius:"50%",background:S2?.gradient,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{S2?.emoji}</div>
                  }
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:700,color:"#1a2744"}}>{r.name}</span>
                      <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:S2?.chip,color:S2?.accent,fontWeight:600}}>{S2?.ko} · {r.subtype}</span>
                      {r.history?.length>0 && <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"#fff0e8",color:"#C45C30",fontWeight:600}}>🔄 재진단{r.history.length}회</span>}
                    </div>
                    <div style={{fontSize:11,color:"#999",marginTop:2}}>{r.date} · <strong style={{color:"#1a2744",letterSpacing:1}}>{r.code}</strong></div>
                  </div>
                </div>
                {r.memo && <div style={{fontSize:11,color:"#888",marginTop:8,paddingTop:8,borderTop:"0.5px solid #f0f0f0"}}>📝 {r.memo}</div>}
                {/* 이력 */}
                {r.history?.length>0 && (
                  <div style={{marginTop:8,paddingTop:8,borderTop:"0.5px solid #f0f0f0"}}>
                    <div style={{fontSize:10,color:"#C45C30",fontWeight:700,marginBottom:4}}>재진단 이력</div>
                    {r.history.map((h,i)=>(
                      <div key={i} style={{fontSize:11,color:"#888",marginBottom:2}}>
                        {i+1}차: {SEASON_DATA[h.season]?.ko} · {h.subtype} ({h.date})
                      </div>
                    ))}
                  </div>
                )}
                <div style={{display:"flex",gap:6,marginTop:10}}>
                  <button onClick={()=>handleEdit(r)} style={{flex:1,padding:"7px",borderRadius:8,border:"0.5px solid #ddd",background:"#fff",fontSize:11,cursor:"pointer",color:"#555"}}>🔄 재진단</button>
                  <button onClick={()=>shareKakao(r)} style={{flex:1,padding:"7px",borderRadius:8,border:"0.5px solid #25D366",background:"#f0fff4",fontSize:11,cursor:"pointer",color:"#25D366",fontWeight:600}}>💬 공유</button>
                  <button onClick={()=>downloadPDF(r)} style={{flex:1,padding:"7px",borderRadius:8,border:"0.5px solid #ddd",background:"#fff",fontSize:11,cursor:"pointer",color:"#555"}}>📄 PDF</button>
                  <button onClick={()=>handleDelete(r.code)} style={{padding:"7px 10px",borderRadius:8,border:"0.5px solid #ffcccc",background:"#fff0f0",fontSize:11,cursor:"pointer",color:"#cc0000"}}>🗑</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// 고객 결과 조회
// ══════════════════════════════════════════
function CustomerLookup({ onBack }) {
  const [code, setCode] = useState("");
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState("color");
  const [showHistory, setShowHistory] = useState(false);

  const handleSearch = async () => {
    if(!code.trim()){setError("코드를 입력해주세요.");return;}
    setLoading(true); setError("");
    const r = await findRecord(code);
    if(!r){setError("코드를 찾을 수 없습니다. 다시 확인해주세요.");setLoading(false);return;}
    setRecord(r); setLoading(false);
    fetchAi(r);
  };

  const fetchAi = async (r) => {
    setAiLoading(true);
    const S = SEASON_DATA[r.season];
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:600,
          messages:[{role:"user",content:`당신은 10년차 퍼스널컬러 전문가입니다.
고객: ${r.name}님 / ${S.ko} ${r.subtype} 타입 / 진단일: ${r.date}
${r.history?.length>0?`이전 진단: ${r.history.map(h=>`${SEASON_DATA[h.season]?.ko} ${h.subtype}`).join(", ")}`:""}
${r.memo?`강사 메모: ${r.memo}`:""}
${r.name}님을 위한 따뜻하고 전문적인 맞춤 분석을 3~4문장으로 작성해주세요. 이름을 불러주고, 시즌 특성과 실생활 스타일링 팁을 포함해주세요. 이모지 1~2개 포함.`}]
        })
      });
      const data = await res.json();
      setAiText(data.content?.map(b=>b.text||"").join("")||S.desc);
    } catch { setAiText(SEASON_DATA[r.season]?.desc||""); }
    setAiLoading(false);
  };

  if(!record) return (
    <Card>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:36,marginBottom:8}}>🎨</div>
        <h2 style={{fontSize:18,fontWeight:700,color:"#1a2744",marginBottom:6}}>결과 조회</h2>
        <p style={{fontSize:12,color:"#999",lineHeight:1.6}}>강사에게 받은 코드를<br/>입력해주세요</p>
      </div>
      <input value={code} onChange={e=>{setCode(e.target.value.toUpperCase());setError("");}}
        onKeyDown={e=>e.key==="Enter"&&handleSearch()} placeholder="예: PC1A2B3C" maxLength={10}
        style={{width:"100%",padding:"14px",borderRadius:10,marginBottom:6,border:error?"1.5px solid #e44":"0.5px solid #ddd",fontSize:18,fontWeight:700,textAlign:"center",letterSpacing:4,outline:"none",fontFamily:"'Noto Sans KR',sans-serif",color:"#1a2744"}}/>
      {error && <p style={{fontSize:12,color:"#e44",marginBottom:10,textAlign:"center"}}>{error}</p>}
      <Btn onClick={handleSearch} style={{opacity:loading?0.6:1,marginBottom:8}}>{loading?"조회 중...":"결과 확인하기 →"}</Btn>
      <Btn variant="light" onClick={onBack}>← 돌아가기</Btn>
      <div style={{marginTop:14,padding:"12px",background:"#f8f8f8",borderRadius:10,textAlign:"center"}}>
        <p style={{fontSize:11,color:"#999",lineHeight:1.6}}>코드는 진단 완료 후 강사에게<br/>카카오톡으로 전달됩니다</p>
      </div>
    </Card>
  );

  const S = SEASON_DATA[record.season];
  return (
    <div>
      {/* 결과 헤더 */}
      <div style={{background:S.gradient,borderRadius:20,padding:"24px 20px",marginBottom:12,textAlign:"center",position:"relative"}}>
        {record.photo && (
          <img src={record.photo} style={{width:72,height:72,borderRadius:"50%",objectFit:"cover",border:`3px solid ${S.accent}60`,marginBottom:10}}/>
        )}
        <div style={{fontSize:record.photo?24:40,marginBottom:4}}>{!record.photo&&S.emoji}</div>
        <div style={{fontSize:10,letterSpacing:2,color:S.accent,fontWeight:700,marginBottom:4}}>YOUR PERSONAL COLOR</div>
        <h2 style={{fontSize:22,fontWeight:800,color:"#1a2744",marginBottom:2}}>{record.name}님</h2>
        <div style={{fontSize:17,fontWeight:700,color:S.accent,marginBottom:4}}>{S.ko} · {record.subtype}</div>
        <div style={{fontSize:11,color:"#999",marginBottom:12}}>진단일: {record.date} · 컬러인에듀센터</div>
        <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:6}}>
          {S.keywords.map(k=><span key={k} style={{background:"rgba(255,255,255,0.65)",color:S.accent,border:`0.5px solid ${S.accent}40`,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:600}}>{k}</span>)}
        </div>
        {record.history?.length>0 && (
          <button onClick={()=>setShowHistory(!showHistory)} style={{marginTop:10,background:"rgba(255,255,255,0.6)",border:`0.5px solid ${S.accent}40`,borderRadius:20,padding:"4px 12px",fontSize:11,color:S.accent,cursor:"pointer",fontWeight:600}}>
            🔄 재진단 이력 {record.history.length}건 {showHistory?"▲":"▼"}
          </button>
        )}
        {showHistory && record.history?.map((h,i)=>(
          <div key={i} style={{marginTop:6,background:"rgba(255,255,255,0.5)",borderRadius:10,padding:"8px 12px",fontSize:11,color:"#555"}}>
            {i+1}차: {SEASON_DATA[h.season]?.ko} · {h.subtype} ({h.date})
          </div>
        ))}
      </div>

      {/* AI 분석 */}
      <Card>
        <SecTitle accent={S.accent}>✨ AI 전문가 분석</SecTitle>
        {aiLoading
          ? <div style={{display:"flex",gap:6,padding:"8px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:S.accent,animation:`bounce ${0.5+i*0.15}s ease-in-out infinite alternate`}}/>)}</div>
          : <p style={{fontSize:13,color:"#3a2818",lineHeight:1.85}}>{aiText}</p>
        }
      </Card>

      {/* 탭 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5,marginBottom:12}}>
        {[{id:"color",label:"🎨",sub:"컬러"},{id:"makeup",label:"💄",sub:"뷰티"},{id:"style",label:"👗",sub:"스타일"},{id:"jewelry",label:"💎",sub:"주얼리"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 4px",borderRadius:10,border:"none",cursor:"pointer",background:tab===t.id?"#1a2744":"rgba(255,255,255,0.7)",color:tab===t.id?"#fff":"#8C6040",fontSize:10,fontWeight:600,transition:"all 0.2s"}}>
            <div style={{fontSize:16}}>{t.label}</div>{t.sub}
          </button>
        ))}
      </div>

      <Card>
        {tab==="color" && (
          <div>
            <SecTitle accent={S.accent}>BEST COLORS</SecTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:14}}>
              {S.best.map((c,i)=><div key={i} style={{aspectRatio:1,borderRadius:8,background:c,border:"0.5px solid rgba(0,0,0,0.07)"}}/>)}
            </div>
            <SecTitle accent="#999">AVOID COLORS</SecTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {S.worst.map((c,i)=><div key={i} style={{aspectRatio:1,borderRadius:8,background:c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"rgba(255,255,255,0.7)"}}>✕</div>)}
            </div>
          </div>
        )}
        {tab==="makeup" && (
          <div>
            {[{label:"💋 립 & 블러셔",colors:[S.makeup.lip,S.makeup.blush]},{label:"👁 아이섀도",colors:[S.makeup.shadow,S.best[2],S.best[3]]},{label:"💇 헤어 컬러",colors:S.hair,names:S.hairNames}].map(g=>(
              <div key={g.label} style={{marginBottom:14}}>
                <div style={{fontSize:11,color:S.accent,fontWeight:600,marginBottom:8}}>{g.label}</div>
                <div style={{display:"flex",gap:8}}>
                  {g.colors.map((c,i)=>(
                    <div key={i} style={{textAlign:"center"}}>
                      <div style={{width:44,height:44,borderRadius:10,background:c,border:"0.5px solid rgba(0,0,0,0.08)",marginBottom:4}}/>
                      {g.names&&<div style={{fontSize:8,color:"#888",width:44,wordBreak:"break-word",lineHeight:1.3}}>{g.names[i]}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==="style" && (
          <div>
            <SecTitle accent={S.accent}>스타일 키워드</SecTitle>
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
              {S.style.map(s=><Tag key={s} accent={S.accent} chip={S.chip}>{s}</Tag>)}
            </div>
            <div style={{background:S.light,borderRadius:10,padding:"12px 14px"}}>
              <p style={{fontSize:12,color:"#3a2818",lineHeight:1.8}}>{S.desc}</p>
            </div>
          </div>
        )}
        {tab==="jewelry" && (
          <div>
            <SecTitle accent={S.accent}>추천 금속</SecTitle>
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              {S.jewelry.map((j,i)=><Tag key={i} accent={S.accent} chip={S.chip}>{j}</Tag>)}
            </div>
            <SecTitle accent={S.accent}>추천 안경 프레임</SecTitle>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {S.eyewear.map((e,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:S.light,borderRadius:10,border:`0.5px solid ${S.accent}20`}}>
                  <div style={{width:28,height:28,borderRadius:6,background:S.best[i]||S.best[0],border:"0.5px solid rgba(0,0,0,0.08)"}}/>
                  <span style={{fontSize:13,color:"#1a2744",fontWeight:500}}>{e}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 액션 버튼 */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <Btn onClick={()=>shareKakao(record)} variant="green">💬 카카오톡으로 공유하기</Btn>
        <Btn onClick={()=>downloadPDF(record)} variant="light">📄 PDF 다운로드</Btn>
        <Btn variant="light" onClick={()=>{setRecord(null);setCode("");setAiText("");setTab("color");}}>🔍 다른 코드 조회</Btn>
        <Btn variant="light" onClick={onBack}>🏠 홈으로</Btn>
      </div>

      {/* 재방문 예약 */}
      <Card style={{marginTop:12,textAlign:"center"}}>
        <div style={{fontSize:11,color:S.accent,fontWeight:700,letterSpacing:1,marginBottom:8}}>📅 재방문 예약</div>
        <p style={{fontSize:12,color:"#555",lineHeight:1.7,marginBottom:12}}>컬러 교육, 재진단, 스타일링 상담 등<br/>다양한 프로그램을 예약하세요</p>
        <div style={{display:"flex",gap:8}}>
          <a href="tel:0632212802" style={{flex:1,padding:"10px",background:"#1a2744",color:"#fff",borderRadius:10,textDecoration:"none",fontSize:12,fontWeight:600,textAlign:"center"}}>📞 전화 예약</a>
          <a href="https://pf.kakao.com" target="_blank" rel="noreferrer" style={{flex:1,padding:"10px",background:"#FAE100",color:"#3c1e00",borderRadius:10,textDecoration:"none",fontSize:12,fontWeight:600,textAlign:"center"}}>💬 카카오 예약</a>
        </div>
      </Card>
    </div>
  );
}
