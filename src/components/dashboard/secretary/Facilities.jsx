import React,{useMemo,useState} from "react";

export default function Facilities(){

const [selected,setSelected]=useState(null);
const [search,setSearch]=useState("");
const [status,setStatus]=useState("");

const [facilities,setFacilities]=useState([
{ id:1,name:"Party Hall",icon:"🎉",capacity:50,wing:"A",status:"Booked",bookedBy:"Rahul Sharma · 102",date:"25 Sep 2025",maintenance:"Monthly",remarks:"Needs deep cleaning"},
{ id:2,name:"Gym",icon:"🏋️",capacity:30,wing:"B",status:"Available",bookedBy:"—",date:"-",maintenance:"Weekly",remarks:"Equipment OK"},
{ id:3,name:"Swimming Pool",icon:"🏊",capacity:20,wing:"C",status:"Booked",bookedBy:"Kiran Mehta · 305",date:"20 Sep 2025",maintenance:"Bi-weekly",remarks:"Water quality normal"}
]);

/* ---------------- ACTIONS ---------------- */

const handleBook=(f)=>{
setFacilities(p=>p.map(x=>
x.id===f.id
?{...x,status:"Booked",bookedBy:"Secretary",date:new Date().toDateString()}
:x
));
};

const handleApprove=(f)=>{
alert("Booking approved!");
};

const handleReject=(f)=>{
setFacilities(p=>p.map(x=>
x.id===f.id
?{...x,status:"Available",bookedBy:"—",date:"-"}
:x
));
};

/* ----------------------------------------- */

const filtered=useMemo(()=>facilities.filter(f=>
(!search||f.name.toLowerCase().includes(search.toLowerCase())) &&
(!status||f.status===status)
),[search,status,facilities]);

const stats={
total:facilities.length,
available:facilities.filter(x=>x.status==="Available").length,
booked:facilities.filter(x=>x.status==="Booked").length
};

return(
<div className="min-h-screen bg-[#f8fafc] p-10 space-y-10">

<h1 className="text-3xl font-semibold">Facilities</h1>

{/* KPI */}
<div className="grid lg:grid-cols-3 gap-6">
<Stat label="Total Facilities" value={stats.total}/>
<Stat label="Available" value={stats.available}/>
<Stat label="Booked" value={stats.booked}/>
</div>

{/* Toolbar */}
<div className="bg-white p-4 rounded-xl shadow-sm flex gap-4">

<input
placeholder="Search..."
className="border rounded px-4 py-2"
value={search}
onChange={e=>setSearch(e.target.value)}
/>

<select className="border rounded px-3 py-2" onChange={e=>setStatus(e.target.value)}>
<option value="">All</option>
<option>Available</option>
<option>Booked</option>
</select>

</div>

{/* Cards */}
<div className="grid xl:grid-cols-3 gap-8">

{filtered.map(f=>(
<div key={f.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition p-6 space-y-4">

<div className="flex justify-between">
<div className="flex gap-3 items-center">
<div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-xl">
{f.icon}
</div>
<div>
<p className="font-semibold">{f.name}</p>
<p className="text-xs text-gray-400">Wing {f.wing}</p>
</div>
</div>

<Status status={f.status}/>
</div>

<div className="text-sm text-gray-600 space-y-1">
<p>Capacity: {f.capacity}</p>
<p>Booked By: {f.bookedBy}</p>
<p>Date: {f.date}</p>
</div>

<div className="pt-3 flex justify-between items-center">

<button onClick={()=>setSelected(f)} className="text-indigo-600 text-sm">
View →
</button>

<div className="flex gap-3">

{f.status==="Available"&&(
<button onClick={()=>handleBook(f)} className="text-green-600 text-sm">
Book
</button>
)}

{f.status==="Booked"&&(
<>
<button onClick={()=>handleApprove(f)} className="text-indigo-600 text-sm">
Approve
</button>

<button onClick={()=>handleReject(f)} className="text-red-600 text-sm">
Reject
</button>
</>
)}

</div>

</div>

</div>
))}

</div>

{/* Modal */}
{selected&&(
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-xl p-6 w-[420px] space-y-2">

<h2 className="text-xl font-semibold">{selected.icon} {selected.name}</h2>

<p>Wing: {selected.wing}</p>
<p>Status: {selected.status}</p>
<p>Booked By: {selected.bookedBy}</p>
<p>Maintenance: {selected.maintenance}</p>
<p className="text-sm text-gray-500">{selected.remarks}</p>

<div className="flex justify-end pt-4">
<button onClick={()=>setSelected(null)} className="border px-4 py-1 rounded">
Close
</button>
</div>

</div>
</div>
)}

</div>
);
}

/* Small Components */

const Stat=({label,value})=>(
<div className="bg-white p-5 rounded-xl shadow-sm">
<p className="text-xs text-gray-400">{label}</p>
<p className="text-2xl font-bold">{value}</p>
</div>
);

const Status=({status})=>(
<span className={`text-xs px-3 py-1 rounded-full
${status==="Available"?"bg-green-100 text-green-700":"bg-orange-100 text-orange-700"}`}>
{status}
</span>
);
