import React,{useState,useEffect,memo} from "react";
import {getNotices,createNotice,updateNotice,deleteNotice} from "../../../api/notice";

function Notices(){

const [notices,setNotices]=useState([]);
const [loading,setLoading]=useState(true);
const [modal,setModal]=useState(false);
const [editIndex,setEditIndex]=useState(null);
const [search,setSearch]=useState("");

const [form,setForm]=useState({
title:"",
category:"General",
date:"",
validTill:"",
desc:""
});

useEffect(()=>{
(async()=>{
setLoading(true);
const data=await getNotices();
setNotices(data||[]);
setLoading(false);
})();
},[]);

const open=(n=null,i=null)=>{
if(n){
setForm({
title:n.title||"",
category:n.category||"General",
date:n.date?.slice(0,10)||"",
validTill:n.validTill?.slice(0,10)||"",
desc:n.desc||""
});
setEditIndex(i);
}else{
setForm({title:"",category:"General",date:"",validTill:"",desc:""});
setEditIndex(null);
}
setModal(true);
};

const save=async()=>{
if(editIndex!==null){
const id=notices[editIndex].id||notices[editIndex]._id;
const u=await updateNotice(id,form);
setNotices(p=>p.map((x,i)=>i===editIndex?u:x));
}else{
const c=await createNotice(form);
setNotices(p=>[...p,c]);
}
setModal(false);
};

const remove=async(i)=>{
if(!window.confirm("Delete notice?"))return;
const id=notices[i].id||notices[i]._id;
await deleteNotice(id);
setNotices(p=>p.filter((_,x)=>x!==i));
};

const filtered=notices.filter(n=>n.title.toLowerCase().includes(search.toLowerCase()));

return(
<div className="p-8 bg-slate-50 min-h-screen space-y-6">

{/* Header */}
<div className="flex justify-between items-center">
<div>
<h2 className="text-3xl font-bold">Notices</h2>
<p className="text-sm text-gray-500">Create and manage society announcements</p>
</div>

<button onClick={()=>open()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700">
+ New Notice
</button>
</div>

{/* Search */}
<input
placeholder="Search notices..."
value={search}
onChange={e=>setSearch(e.target.value)}
className="border rounded-lg px-4 py-2 w-full md:w-1/3"
/>

{/* Cards */}
{loading?(
<p className="text-gray-400">Loading...</p>
):filtered.length===0?(
<p className="text-gray-400">No notices found.</p>
):(
<div className="grid md:grid-cols-3 gap-6">
{filtered.map((n,i)=>(
<div key={i} className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5 space-y-3">

<div className="flex justify-between">
<h3 className="font-semibold">{n.title}</h3>
<span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700">
{n.category}
</span>
</div>

<p className="text-sm text-gray-500 line-clamp-2">{n.desc}</p>

<div className="flex justify-between text-xs text-gray-400">
<span>From {n.date?.slice(0,10)}</span>
<span>Till {n.validTill?.slice(0,10)}</span>
</div>

<div className="flex justify-end gap-2 pt-2">
<button onClick={()=>open(n,i)} className="text-blue-600 text-sm">Edit</button>
<button onClick={()=>remove(i)} className="text-red-500 text-sm">Delete</button>
</div>

</div>
))}
</div>
)}

{/* Modal */}
{modal&&(
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">

<h3 className="text-xl font-semibold">
{editIndex!==null?"Edit Notice":"New Notice"}
</h3>

<input className="border p-2 rounded w-full" placeholder="Title"
value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>

<select className="border p-2 rounded w-full"
value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
{["General","Maintenance","Emergency","Event"].map(x=>
<option key={x}>{x}</option>
)}
</select>

<input type="date" className="border p-2 rounded w-full"
value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>

<input type="date" className="border p-2 rounded w-full"
value={form.validTill} onChange={e=>setForm({...form,validTill:e.target.value})}/>

<textarea className="border p-2 rounded w-full"
placeholder="Description"
value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>

<div className="flex justify-end gap-3 pt-2">
<button onClick={()=>setModal(false)} className="text-gray-500">Cancel</button>
<button onClick={save} className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
</div>

</div>
</div>
)}

</div>
);
}

export default memo(Notices);
