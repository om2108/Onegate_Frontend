import React,{useEffect,useState} from "react";
import {Search,Home,User,Phone,Clock,CheckCircle,XCircle} from "lucide-react";
import { getMembers } from "../../../api/member";

export default function ResidentVerification(){

const [search,setSearch]=useState("");
const [members,setMembers]=useState([]);
const [resident,setResident]=useState(null);
const [loading,setLoading]=useState(false);
const [apiError,setApiError]=useState("");
const [status,setStatus]=useState("confirmed");
const [notes,setNotes]=useState("");

const societyId=localStorage.getItem("secretarySocietyId");

/* Load Members */
useEffect(()=>{

if(!societyId) return;

(async()=>{
try{
const res=await getMembers(societyId);
setMembers(Array.isArray(res)?res:[]);
}catch{
setApiError("Permission denied or server unavailable");
}
})();

},[societyId]);

/* Search Resident */
const handleSearch=e=>{
e.preventDefault();
if(!search) return;

setLoading(true);
setResident(null);
setApiError("");

setTimeout(()=>{

const found=members.find(m=>{
const flat=m.flat||m.flatNo||m.flatNumber||m.unit||"";
return flat.toUpperCase().trim()===search.toUpperCase().trim();
});

setResident(found||{error:true});
setLoading(false);

},300);
};

/* Submit */
const submitVerification=e=>{
e.preventDefault();
if(!resident||resident.error) return;

alert(`Verification saved for Flat ${resident.flat||resident.flatNo||resident.flatNumber}`);

setSearch("");
setResident(null);
setNotes("");
};

/* UI */
return(
<div className="max-w-4xl mx-auto p-6 space-y-6">

<h2 className="text-2xl font-bold text-sky-600">Resident Verification</h2>

{/* Search */}
<form onSubmit={handleSearch} className="bg-white rounded-xl shadow p-4 flex gap-3">

<div className="flex items-center border rounded-lg px-3 flex-1">
<Search className="text-sky-600 mr-2"/>
<input
value={search}
onChange={e=>setSearch(e.target.value.toUpperCase())}
placeholder="Enter Flat Number"
className="flex-1 outline-none"
/>
</div>

<button className="bg-sky-600 text-white px-6 rounded-lg hover:bg-sky-700">
Search
</button>

</form>

{loading&&(
<div className="text-center text-gray-400 animate-pulse">Searching resident…</div>
)}

{apiError&&(
<div className="bg-red-50 text-red-600 p-3 rounded">{apiError}</div>
)}

{resident?.error&&(
<div className="bg-yellow-50 text-yellow-600 p-3 rounded">Resident not found</div>
)}

{/* Resident Card */}
{resident&&!resident.error&&(

<form onSubmit={submitVerification} className="bg-white rounded-xl shadow p-6 space-y-6">

<div className="flex items-center gap-2 text-green-600 font-semibold">
<CheckCircle/> Resident Verified
</div>

<div className="grid md:grid-cols-2 gap-4 text-sm">

<p className="flex gap-2"><User className="text-sky-600"/>{resident.fullName||resident.name}</p>
<p className="flex gap-2"><Phone className="text-sky-600"/>{resident.phone||"—"}</p>
<p className="flex gap-2"><Home className="text-sky-600"/>Flat {resident.flat||resident.flatNo||resident.flatNumber}</p>
<p className="flex gap-2"><Clock className="text-sky-600"/>Role: {resident.role}</p>

</div>

<div className="border-t pt-4 space-y-3">

<label className="flex gap-2 items-center">
<input type="radio" checked={status==="confirmed"} onChange={()=>setStatus("confirmed")}/>
<span className="text-green-600 font-medium">Confirmed</span>
</label>

<label className="flex gap-2 items-center">
<input type="radio" checked={status==="denied"} onChange={()=>setStatus("denied")}/>
<span className="text-red-600 font-medium">Denied</span>
</label>

<textarea
rows="3"
value={notes}
onChange={e=>setNotes(e.target.value)}
placeholder="Verification notes"
className="w-full border rounded-lg p-3"
/>

</div>

<div className="flex justify-end gap-3">

<button type="button" onClick={()=>setNotes("")}
className="border px-4 py-1 rounded hover:bg-gray-100">
Reset
</button>

<button className="bg-sky-600 text-white px-6 py-1 rounded hover:bg-sky-700">
Submit
</button>

</div>

</form>
)}

</div>
);
}
