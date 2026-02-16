import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, RotateCcw, Zap } from "lucide-react";
import { uploadToCloudinary } from "../../../api/upload";
import { addVisitor } from "../../../api/visitor";

const AUTO_CAPTURE_DELAY = 1500;

export default function ImageVerification() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const autoTimerRef = useRef(null);
  const shutterAudio = useRef(new Audio("/camera-shutter.mp3"));

  const [visitorName, setVisitorName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [facingMode, setFacingMode] = useState("environment");
  const [flashOn, setFlashOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState({ min: 1, max: 1 });
  const [exposure, setExposure] = useState(0);
  const [exposureRange, setExposureRange] = useState({ min: 0, max: 0 });
  const [faceBox, setFaceBox] = useState(null);
  const [ripple, setRipple] = useState(false);

  const societyId = "SOC001";

  const haptic = () => navigator.vibrate?.(40);
  const shutterSound = () => {
    shutterAudio.current.currentTime = 0;
    shutterAudio.current.play().catch(()=>{});
  };

  const closeCamera = () => {
    setShowCamera(false);
    setFaceBox(null);
    clearTimeout(autoTimerRef.current);
    streamRef.current?.getTracks().forEach(t=>t.stop());
  };

  const openCamera = async () => {
    setShowCamera(true);

    const stream = await navigator.mediaDevices.getUserMedia({ video:{facingMode} });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;

    const track = stream.getVideoTracks()[0];
    const caps = track.getCapabilities?.();

    caps?.torch && setTorchSupported(true);
    caps?.zoom && setZoomRange({min:caps.zoom.min,max:caps.zoom.max});
    caps?.exposureCompensation &&
      setExposureRange({min:caps.exposureCompensation.min,max:caps.exposureCompensation.max});

    if ("FaceDetector" in window) {
      faceDetectorRef.current = new window.FaceDetector({ fastMode:true });
      faceLoop();
    }
  };

  const faceLoop = async () => {
    if (!faceDetectorRef.current || !showCamera) return;
    try {
      const faces = await faceDetectorRef.current.detect(videoRef.current);
      if (faces.length) {
        setFaceBox(faces[0].boundingBox);
        if (!autoTimerRef.current)
          autoTimerRef.current = setTimeout(capturePhoto, AUTO_CAPTURE_DELAY);
      } else {
        setFaceBox(null);
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current=null;
      }
    } catch{}
    requestAnimationFrame(faceLoop);
  };

  const flipCamera = () => {
    closeCamera();
    setFacingMode(p=>p==="environment"?"user":"environment");
    setTimeout(openCamera,200);
  };

  const toggleFlash = async () => {
    if (!torchSupported) return alert("Flash not supported");
    await streamRef.current.getVideoTracks()[0]
      .applyConstraints({advanced:[{torch:!flashOn}]});
    setFlashOn(v=>!v);
  };

  const handleZoom = v =>
    streamRef.current.getVideoTracks()[0]
      .applyConstraints({advanced:[{zoom:Number(v)}]});

  const handleExposure = v =>
    streamRef.current.getVideoTracks()[0]
      .applyConstraints({advanced:[{exposureCompensation:Number(v)}]});

  const capturePhoto = () => {
    haptic(); shutterSound();
    setRipple(true); setTimeout(()=>setRipple(false),300);

    const v = videoRef.current, c = canvasRef.current;
    c.width=v.videoWidth; c.height=v.videoHeight;
    c.getContext("2d").drawImage(v,0,0);

    c.toBlob(b=>{
      const f=new File([b],"visitor.jpg",{type:"image/jpeg"});
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
      setCapturedPhoto(true);
      closeCamera();
    });
  };

  const handleSendApproval = async () => {
    if(!visitorName||!photoFile)return alert("Name & photo required");
    setLoading(true); setUploadProgress(0);

    try{
      const imageUrl = await uploadToCloudinary(photoFile,p=>setUploadProgress(p));
      await addVisitor({societyId,visitorName,vehicleNumber,imageUrl,status:"PENDING"});
      setToastType("success"); setToast("Visitor sent for approval ✅");
      setTimeout(()=>{setToast("");navigate("/dashboard/watchman/pending-approvals");},1500);
    }catch{
      setToastType("error"); setToast("Upload failed ❌");
      setTimeout(()=>setToast(""),2000);
    }
    setLoading(false);
  };

  return (
  <>
{showCamera &&
<div className="fixed inset-0 bg-black z-50">
<video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"/>

{faceBox &&
<div className="absolute border-2 border-green-400 rounded-xl pointer-events-none"
style={{left:faceBox.x,top:faceBox.y,width:faceBox.width,height:faceBox.height}}/>}

<button onClick={toggleFlash} className="absolute top-4 left-4 bg-white p-2 rounded-full shadow cursor-pointer"><Zap size={20}/></button>
<button onClick={flipCamera} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow cursor-pointer"><RotateCcw size={20}/></button>

<button onClick={capturePhoto} className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white p-5 rounded-full shadow-xl cursor-pointer active:scale-95 transition overflow-hidden">
{ripple&&<span className="absolute inset-0 bg-black/10 animate-ping rounded-full"/>}
<Camera size={28}/>
</button>

<canvas ref={canvasRef} hidden/>
</div>}

<div className="min-h-screen flex justify-center items-center bg-slate-50 p-4">
<div className="bg-white max-w-5xl w-full p-8 rounded-2xl shadow">
<h2 className="text-2xl font-bold text-sky-600">Visitor Image Verification</h2>

<div className="grid md:grid-cols-2 gap-8 mt-6">
<div>
<div className="aspect-square border-2 border-dashed rounded-xl bg-gray-100 flex items-center justify-center">
{!capturedPhoto?
<button onClick={openCamera} className="cursor-pointer"><Camera size={40}/> Open Camera</button>
:<img src={photoPreview} className="w-full h-full object-cover rounded-xl"/>}
</div>
{capturedPhoto&&<button onClick={()=>{setCapturedPhoto(false);openCamera();}} className="text-sky-600 mt-2">Retake</button>}
</div>

<div className="space-y-4">
<input value={visitorName} onChange={e=>setVisitorName(e.target.value)} placeholder="Visitor" className="border p-3 w-full rounded"/>
<input value={vehicleNumber} onChange={e=>setVehicleNumber(e.target.value)} placeholder="Vehicle" className="border p-3 w-full rounded"/>

<button disabled={loading} onClick={handleSendApproval}
className={`bg-sky-600 text-white w-full py-3 rounded flex justify-center items-center gap-2 ${loading?"opacity-60":"hover:bg-sky-700"}`}>
{loading&&<span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
{loading?`Uploading ${uploadProgress}%`:"Send For Approval"}
</button>

{loading&&<div className="w-full h-2 bg-gray-200 rounded"><div className="h-full bg-sky-600" style={{width:`${uploadProgress}%`}}/></div>}

<div className="flex gap-3">
<button onClick={()=>navigate("/dashboard/watchman/pending-approvals")} className="flex-1 border py-2 rounded hover:bg-gray-100">Pending</button>
<button onClick={()=>navigate("/dashboard/watchman/approved-visitors")} className="flex-1 border py-2 rounded hover:bg-gray-100">Approved</button>
</div>
</div>
</div>
</div>
</div>

{toast &&
<div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-white shadow
${toastType==="success"?"bg-green-600":"bg-red-600"}`}>{toast}</div>}
</>);
}
