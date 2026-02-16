import React,{useEffect,useMemo,useState} from "react";
import {Bar,Doughnut} from "react-chartjs-2";
import {
Chart as ChartJS,
BarElement,
ArcElement,
CategoryScale,
LinearScale,
Tooltip,
Legend
} from "chart.js";

import {useAuth} from "../../../context/AuthContext";
import {getMembers} from "../../../api/member";
import {getComplaintsBySociety} from "../../../api/complaint";
import {getVisitors} from "../../../api/visitor";
import {getAllSocieties} from "../../../api/society";

ChartJS.register(
BarElement,
ArcElement,
CategoryScale,
LinearScale,
Tooltip,
Legend
);

/* ---------- KPI CARD ---------- */
const KPI=({title,value,icon})=>(
<div className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition">
<div className="flex justify-between items-center">
<div>
<p className="text-xs text-gray-400">{title}</p>
<p className="text-2xl font-bold mt-1">{value}</p>
</div>
<div className="text-3xl">{icon}</div>
</div>
</div>
);

export default function SecretaryHome(){

const {user}=useAuth();
const isAdmin=user?.role==="ADMIN";

const [societies,setSocieties]=useState([]);
const [societyId,setSocietyId]=useState(localStorage.getItem("secretarySocietyId")||"");

const [members,setMembers]=useState([]);
const [complaints,setComplaints]=useState([]);
const [visitors,setVisitors]=useState([]);

useEffect(()=>{
(async()=>{
const s=await getAllSocieties();
setSocieties(s||[]);
if(!societyId && s?.length){
setSocietyId(s[0].id||s[0]._id);
}
})();
},[]);

useEffect(()=>{
if(!societyId) return;

(async()=>{
const m=await getMembers(societyId);
setMembers(m||[]);

const c=await getComplaintsBySociety(societyId);
setComplaints(c||[]);

const ids=(m||[]).map(x=>x.id).filter(Boolean);
const v=await getVisitors(societyId,ids);
setVisitors(v||[]);
})();
},[societyId]);

const today=new Date().toISOString().slice(0,10);

const visitorsToday=visitors.filter(v=>v.createdAt?.slice(0,10)===today).length;
const complaintsToday=complaints.filter(c=>c.createdAt?.slice(0,10)===today).length;

const status=useMemo(()=>{
let r=0,p=0,i=0;
complaints.forEach(c=>{
if(c.status==="RESOLVED") r++;
else if(c.status==="IN_PROGRESS") i++;
else p++;
});
return {r,p,i};
},[complaints]);

/* Charts */

const barData={
labels:["Jan","Feb","Mar","Apr","May","Jun"],
datasets:[{
label:"Maintenance",
data:[30000,40000,35000,50000,45000,60000],
backgroundColor:"#6366f1",
borderRadius:8
}]
};

const pieData={
labels:["Resolved","Pending","In Progress"],
datasets:[{
data:[status.r,status.p,status.i],
backgroundColor:["#22c55e","#f97316","#3b82f6"]
}]
};

return(
<div className="bg-slate-50 min-h-screen p-8 space-y-8">

{/* Header */}
<div className="flex justify-between items-center">
<div>
<h1 className="text-3xl font-bold">Secretary Dashboard</h1>
<p className="text-gray-500 text-sm">Society Management Overview</p>
</div>

{isAdmin &&
<select
className="border rounded-lg px-3 py-2 text-sm"
value={societyId}
onChange={e=>{
setSocietyId(e.target.value);
localStorage.setItem("secretarySocietyId",e.target.value);
}}>
{societies.map(s=>(
<option key={s.id||s._id} value={s.id||s._id}>{s.name}</option>
))}
</select>
}
</div>

{/* KPIs */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

<KPI title="Residents" value={members.length} icon="👥"/>
<KPI title="Visitors Today" value={visitorsToday} icon="🚪"/>
<KPI title="Bookings" value="23" icon="🏛️"/>
<KPI title="Complaints Today" value={complaintsToday} icon="🧾"/>
<KPI title="Total Complaints" value={complaints.length} icon="📌"/>

</div>

{/* Charts */}
<div className="grid lg:grid-cols-2 gap-8">

<div className="bg-white rounded-2xl shadow p-6 h-[320px]">
<h3 className="font-semibold mb-3">Maintenance Collection</h3>
<Bar data={barData}/>
</div>

<div className="bg-white rounded-2xl shadow p-6 h-[320px]">
<h3 className="font-semibold mb-3">Complaint Status</h3>
<Doughnut data={pieData}/>
</div>

</div>

</div>
);
}
