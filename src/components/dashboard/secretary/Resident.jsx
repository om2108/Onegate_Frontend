import React,{useEffect,useMemo,useState} from "react";
import {Doughnut} from "react-chartjs-2";
import {
Chart as ChartJS,
ArcElement,
Tooltip,
Legend
} from "chart.js";

import {getMembers} from "../../../api/member";

ChartJS.register(ArcElement,Tooltip,Legend);

export default function Resident(){

const [residents,setResidents]=useState([]);
const [search,setSearch]=useState("");
const [selected,setSelected]=useState(null);
const [loading,setLoading]=useState(true);

useEffect(()=>{
(async()=>{
const societyId=localStorage.getItem("secretarySocietyId");
if(!societyId) return;

const data=await getMembers(societyId);

setResidents((data||[]).map(m=>({
id:m.id||m._id,
name:m.fullName||m.email||"Resident",
flat:m.flat||m.unit||"—",
role:m.role||"Member",
email:m.email||"",
phone:m.phone||"",
joined:m.joinedAt?.slice(0,10)
})));

setLoading(false);
})();
},[]);

const list=useMemo(()=>residents.filter(r=>
r.name.toLowerCase().includes(search.toLowerCase())||
r.flat.toLowerCase().includes(search.toLowerCase())
),[residents,search]);

const owners=residents.filter(r=>r.role==="OWNER").length;
const tenants=residents.filter(r=>r.role==="TENANT").length;

const pie={
labels:["Owners","Tenants"],
datasets:[{data:[owners,tenants],backgroundColor:["#22c55e","#f97316"]}]
};

return(
<div className="p-8 bg-slate-50 min-h-screen space-y-6">

<h2 className="text-3xl font-bold">Residents</h2>

<input
placeholder="Search resident..."
className="border px-4 py-2 rounded-lg w-64"
value={search}
onChange={e=>setSearch(e.target.value)}
/>

<div className="grid md:grid-cols-4 gap-4">
<Card title="Total Residents" value={residents.length}/>
<Card title="Owners" value={owners}/>
<Card title="Tenants" value={tenants}/>
<Card title="Flats" value={new Set(residents.map(r=>r.flat)).size}/>
</div>

<div className="bg-white p-4 rounded-xl shadow w-72">
<Doughnut data={pie}/>
</div>

{/* Directory */}

{loading?(
<p className="text-gray-400">Loading residents...</p>
):list.length===0?(
<p className="text-gray-400">No residents found.</p>
):(
<div className="grid md:grid-cols-3 gap-6">
{list.map(r=>(
<div key={r.id} className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition">

<h3 className="font-semibold">{r.name}</h3>
<p className="text-sm text-gray-500">{r.flat}</p>
<p className="text-xs text-gray-400">{r.role}</p>

<div className="flex gap-2 pt-3">
<button onClick={()=>setSelected(r)} className="text-blue-600 text-sm">View</button>
{r.phone&&<span>📞</span>}
{r.email&&<span>📧</span>}
</div>

</div>
))}
</div>
)}

{/* Modal */}
{selected&&(
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div className="bg-white rounded-xl p-6 w-80 space-y-2">

<h3 className="font-semibold">{selected.name}</h3>
<p>Flat: {selected.flat}</p>
<p>Role: {selected.role}</p>
<p>Email: {selected.email||"—"}</p>
<p>Joined: {selected.joined||"—"}</p>

<button onClick={()=>setSelected(null)} className="mt-3 border px-3 py-1 rounded">
Close
</button>

</div>
</div>
)}

</div>
);
}

const Card=({title,value})=>(
<div className="bg-white p-4 rounded-xl shadow">
<p className="text-xs text-gray-500">{title}</p>
<p className="text-2xl font-bold">{value}</p>
</div>
);
