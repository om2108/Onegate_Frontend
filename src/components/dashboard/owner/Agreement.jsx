import React,{useEffect,useState} from "react";

export default function TenantAgreementList(){

const [tenants,setTenants]=useState([]);
const [loading,setLoading]=useState(true);
const [selected,setSelected]=useState(null);

// Mock data
const mockTenants=[
{ id:1,name:"Amit Sharma",property:"Sunrise Apartment 102",rent:"₹15,000",leaseStart:"2024-01-01",leaseEnd:"2024-12-31",approved:false},
{ id:2,name:"Priya Patel",property:"GreenVille Villa 8B",rent:"₹25,000",leaseStart:"2024-03-15",leaseEnd:"2025-03-14",approved:false},
{ id:3,name:"Rahul Mehta",property:"Silver Heights 5A",rent:"₹18,500",leaseStart:"2024-05-01",leaseEnd:"2025-04-30",approved:false}
];

useEffect(()=>{
setTimeout(()=>{
setTenants(mockTenants);
setLoading(false);
},800);
},[]);

/* ---------- Approve Handler ---------- */

const approveTenant=(id)=>{
setTenants(prev=>prev.map(t=>
t.id===id?{...t,approved:true}:t
));
alert("Tenant agreement approved!");
};

/* ----------------------------------- */

if(loading)
return <p className="text-center text-gray-400 py-10">Loading tenants...</p>;

return(
<div className="p-8 bg-slate-50 min-h-screen space-y-6">

<h2 className="text-3xl font-semibold">Tenant Agreements</h2>

<div className="grid md:grid-cols-3 gap-6">

{tenants.map(t=>(
<div key={t.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 space-y-3">

<div className="flex justify-between">
<h3 className="font-semibold">{t.name}</h3>

{t.approved&&(
<span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
Approved
</span>
)}

</div>

<p className="text-sm text-gray-500">{t.property}</p>
<p className="text-sm">Rent: {t.rent}</p>
<p className="text-xs text-gray-400">
Lease: {t.leaseStart} → {t.leaseEnd}
</p>

<div className="flex gap-2 pt-2">

<button
onClick={()=>setSelected(t)}
className="border px-3 py-1.5 rounded text-sm hover:bg-gray-50">
View Agreement
</button>

<button
disabled={t.approved}
onClick={()=>approveTenant(t.id)}
className={`px-3 py-1.5 rounded text-sm text-white
${t.approved?"bg-gray-400":"bg-indigo-600 hover:bg-indigo-700"}`}>
{t.approved?"Approved":"Approve"}
</button>

</div>

</div>
))}

</div>

{/* Modal */}
{selected&&(
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-xl p-6 w-[380px] space-y-3">

<h3 className="text-xl font-semibold">{selected.name}</h3>

<p><strong>Property:</strong> {selected.property}</p>
<p><strong>Rent:</strong> {selected.rent}</p>
<p><strong>Lease:</strong> {selected.leaseStart} → {selected.leaseEnd}</p>

<div className="pt-4 flex justify-end">
<button onClick={()=>setSelected(null)} className="border px-4 py-1.5 rounded">
Close
</button>
</div>

</div>
</div>
)}

</div>
);
}
