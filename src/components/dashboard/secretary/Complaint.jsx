import React,{useState,useMemo,useEffect,memo} from "react";
import {
getComplaintsBySociety,
updateComplaintStatus,
deleteComplaint as deleteComplaintApi
} from "../../../api/complaint";

const CATEGORY=["All","Maintenance","Security","Other"];
const STATUS=["All","Pending","In Progress","Resolved"];
const PRIORITY=["All","Low","Medium","High"];

export default memo(function Complaint(){

const [complaints,setComplaints]=useState([]);
const [filters,setFilters]=useState({category:"All",status:"All",priority:"All"});
const [editing,setEditing]=useState(null);
const [edit,setEdit]=useState({status:"",assignedTo:"",priority:""});
const [loading,setLoading]=useState(true);

useEffect(()=>{
(async()=>{
const societyId=localStorage.getItem("secretarySocietyId");
if(!societyId) return;

const data=await getComplaintsBySociety(societyId);

setComplaints((data||[]).map(c=>({
id:c.id||c._id,
title:c.description||"Complaint",
category:c.category||"Other",
date:c.createdAt?.slice(0,10),
status:c.status||"Pending",
assignedTo:c.assignedTo||"",
priority:c.priority||"Medium"
})));

setLoading(false);
})();
},[]);

const list=useMemo(()=>complaints.filter(c=>
(filters.category==="All"||c.category===filters.category)&&
(filters.status==="All"||c.status===filters.status)&&
(filters.priority==="All"||c.priority===filters.priority)
),[complaints,filters]);

const open=(c)=>{
setEditing(c);
setEdit({status:c.status,assignedTo:c.assignedTo,priority:c.priority});
};

const save=async()=>{
await updateComplaintStatus(editing.id,edit.status,edit.priority);
setComplaints(p=>p.map(x=>x.id===editing.id?{...x,...edit}:x));
setEditing(null);
};

const remove=async(c)=>{
if(!window.confirm("Delete complaint?"))return;
await deleteComplaintApi(c.id);
setComplaints(p=>p.filter(x=>x.id!==c.id));
};

return(
<div className="p-8 bg-slate-50 min-h-screen space-y-6">

{/* Header */}
<div>
<h2 className="text-3xl font-bold">Complaints</h2>
<p className="text-sm text-gray-500">Track and resolve society issues</p>
</div>

{/* Filters */}
<div className="flex gap-3 flex-wrap">
{[CATEGORY,STATUS,PRIORITY].map((arr,i)=>(
<select key={i}
className="border rounded-lg px-3 py-2 text-sm"
onChange={e=>setFilters(p=>({...p,[["category","status","priority"][i]]:e.target.value}))}>
{arr.map(x=><option key={x}>{x}</option>)}
</select>
))}
</div>

{/* Cards */}
{loading?(
<p className="text-gray-400">Loading...</p>
):list.length===0?(
<p className="text-gray-400">No complaints found.</p>
):(
<div className="grid md:grid-cols-3 gap-6">

{list.map(c=>(
<div key={c.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5 space-y-3">

<div className="flex justify-between">
<h3 className="font-semibold">{c.title}</h3>
<span className={`text-xs px-2 py-1 rounded
${c.status==="Resolved"?"bg-green-100 text-green-700":
c.status==="In Progress"?"bg-blue-100 text-blue-700":
"bg-yellow-100 text-yellow-700"}`}>
{c.status}
</span>
</div>

<p className="text-xs text-gray-400">{c.date}</p>

<div className="flex justify-between text-sm">
<span className="text-gray-500">{c.category}</span>
<span className={`text-xs px-2 py-1 rounded
${c.priority==="High"?"bg-red-100 text-red-700":
c.priority==="Medium"?"bg-orange-100 text-orange-700":
"bg-gray-100 text-gray-600"}`}>
{c.priority}
</span>
</div>

<div className="flex justify-end gap-2 pt-2">
<button onClick={()=>open(c)} className="text-blue-600 text-sm">Edit</button>
<button onClick={()=>remove(c)} className="text-red-500 text-sm">Delete</button>
</div>

</div>
))}
</div>
)}

{/* Modal */}
{editing&&(
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">

<h3 className="text-xl font-semibold">Edit Complaint</h3>

<select className="border p-2 rounded w-full"
value={edit.status}
onChange={e=>setEdit({...edit,status:e.target.value})}>
{STATUS.filter(x=>x!=="All").map(x=><option key={x}>{x}</option>)}
</select>

<input className="border p-2 rounded w-full"
placeholder="Assigned to"
value={edit.assignedTo}
onChange={e=>setEdit({...edit,assignedTo:e.target.value})}/>

<select className="border p-2 rounded w-full"
value={edit.priority}
onChange={e=>setEdit({...edit,priority:e.target.value})}>
{PRIORITY.filter(x=>x!=="All").map(x=><option key={x}>{x}</option>)}
</select>

<div className="flex justify-end gap-3">
<button onClick={()=>setEditing(null)} className="text-gray-500">Cancel</button>
<button onClick={save} className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
</div>

</div>
</div>
)}

</div>
);
});
