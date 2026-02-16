import React,{useMemo,useState} from "react";

export default function Reports(){

const [search,setSearch]=useState("");
const [type,setType]=useState("");
const [selected,setSelected]=useState(null);

const [reports,setReports]=useState([
{ id:1,name:"Resident Occupancy",date:"28 Sep 2025",status:"Completed",type:"Residents"},
{ id:2,name:"Visitor Analysis",date:"28 Sep 2025",status:"Pending",type:"Visitors"},
{ id:3,name:"Facility Usage",date:"27 Sep 2025",status:"Completed",type:"Facilities"}
]);

/* ---------------- CSV HELPERS ---------------- */

const downloadCSV=(csv,filename)=>{
const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
const url=URL.createObjectURL(blob);
const link=document.createElement("a");
link.href=url;
link.download=filename;
link.click();
URL.revokeObjectURL(url);
};

const downloadReport=(report)=>{
const rows=[
["Name",report.name],
["Type",report.type],
["Status",report.status],
["Date",report.date]
];
downloadCSV(rows.map(r=>r.join(",")).join("\n"),`${report.name.replace(/\s+/g,"_")}.csv`);
};

const exportAllReports=(list)=>{
if(!list.length)return alert("No reports to export");

const header=["Name","Type","Status","Date"];
const body=list.map(r=>[r.name,r.type,r.status,r.date]);
downloadCSV([header,...body].map(r=>r.join(",")).join("\n"),"All_Reports.csv");
};

/* ---------------- GENERATE REPORT ---------------- */

const generateReport=()=>{
const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});

const newReport={
id:Date.now(),
name:`Custom Report ${reports.length+1}`,
date:now,
status:"Completed",
type:"General"
};

setReports(prev=>[newReport,...prev]);
alert("New report generated!");
};

/* ----------------------------------------------- */

const filtered=useMemo(()=>reports.filter(r=>
(!search||r.name.toLowerCase().includes(search.toLowerCase())) &&
(!type||r.type===type)
),[search,type,reports]);

const stats={
total:reports.length,
completed:reports.filter(x=>x.status==="Completed").length,
pending:reports.filter(x=>x.status==="Pending").length
};

return(
<div className="min-h-screen bg-[#f8fafc] p-10 space-y-10">

<h1 className="text-3xl font-semibold">Reports</h1>

{/* KPIs */}
<div className="grid md:grid-cols-3 gap-6">
<Stat label="Total Reports" value={stats.total}/>
<Stat label="Completed" value={stats.completed}/>
<Stat label="Pending" value={stats.pending}/>
</div>

{/* Toolbar */}
<div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-center">

<input
placeholder="Search..."
className="border rounded-lg px-4 py-2 text-sm w-64"
value={search}
onChange={e=>setSearch(e.target.value)}
/>

<select className="border rounded-lg px-3 py-2 text-sm" onChange={e=>setType(e.target.value)}>
<option value="">All Types</option>
<option>Residents</option>
<option>Visitors</option>
<option>Facilities</option>
<option>General</option>
</select>

<div className="ml-auto flex gap-3">
<button
onClick={()=>exportAllReports(filtered)}
className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50">
Export All
</button>

<button
onClick={generateReport}
className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700">
Generate Report
</button>
</div>

</div>

{/* Cards */}
<div className="grid xl:grid-cols-3 gap-8">

{filtered.map(r=>(
<div key={r.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition p-6 space-y-4">

<div className="flex justify-between">
<div>
<p className="font-semibold">{r.name}</p>
<p className="text-xs text-gray-400">{r.type}</p>
</div>
<Status status={r.status}/>
</div>

<p className="text-sm text-gray-600">Generated on {r.date}</p>

<div className="flex justify-between pt-2">
<button onClick={()=>setSelected(r)} className="text-indigo-600 text-sm">
View →
</button>

<button onClick={()=>downloadReport(r)} className="text-sm text-gray-500">
Download
</button>
</div>

</div>
))}

</div>

{/* Modal */}
{selected&&(
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div className="bg-white rounded-xl p-6 w-96 space-y-2">
<h2 className="font-semibold">{selected.name}</h2>
<p>Type: {selected.type}</p>
<p>Status: {selected.status}</p>
<p>Date: {selected.date}</p>
<button onClick={()=>setSelected(null)} className="mt-3 border px-3 py-1 rounded">Close</button>
</div>
</div>
)}

</div>
);
}

/* Components */

const Stat=({label,value})=>(
<div className="bg-white p-5 rounded-xl shadow-sm">
<p className="text-xs text-gray-400">{label}</p>
<p className="text-2xl font-bold">{value}</p>
</div>
);

const Status=({status})=>(
<span className={`text-xs px-3 py-1 rounded-full
${status==="Completed"?"bg-green-100 text-green-700":"bg-orange-100 text-orange-700"}`}>
{status}
</span>
);
