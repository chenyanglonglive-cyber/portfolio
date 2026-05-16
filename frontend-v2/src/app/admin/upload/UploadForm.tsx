"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { uploadToStrapi, createWorkEntry } from "./actions";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "extracting" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Creative");

  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. 提取视频第 1 秒作为缩略图
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.type.startsWith("video/")) return;

    setFile(selectedFile);
    setTitle(selectedFile.name.split(".")[0]);
    setStatus("extracting");
    setError(null);

    try {
      const thumb = await extractThumbnail(selectedFile);
      setThumbnail(thumb);
      setThumbnailPreview(URL.createObjectURL(thumb));
      setStatus("idle");
    } catch (err) {
      console.error("Thumbnail extraction failed:", err);
      setStatus("idle");
      setError("缩略图提取失败，请检查视频格式（建议使用 H.264）");
    }
  };

  const extractThumbnail = (videoFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const url = URL.createObjectURL(videoFile);

      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = 1; // 捕获第 1 秒
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
              URL.revokeObjectURL(url);
              resolve(file);
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          }, "image/jpeg", 0.85);
        }
      };

      video.onerror = () => reject(new Error("Video loading error"));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !thumbnail) return;

    setStatus("uploading");
    setProgress(10);

    try {
      // 1. 上传缩略图
      const thumbFormData = new FormData();
      thumbFormData.append("files", thumbnail);
      const thumbData = await uploadToStrapi(thumbFormData);
      setProgress(40);

      // 2. 上传视频
      const videoFormData = new FormData();
      videoFormData.append("files", file);
      const videoData = await uploadToStrapi(videoFormData);
      setProgress(80);

      // 3. 创建作品条目
      await createWorkEntry({
        title,
        category,
        videoId: videoData.id,
        thumbnailId: thumbData.id,
        rank: 0,
      });

      setProgress(100);
      setStatus("success");
    } catch (err: any) {
      setError(err.message || "上传过程中发生错误");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-zinc-900/50 rounded-3xl border border-white/5 backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">作品名称</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
              placeholder="输入作品标题"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="Creative">Creative</option>
              <option value="UGC">UGC</option>
              <option value="AI">AI</option>
              <option value="Data">Data</option>
            </select>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="relative group">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={status === "uploading"}
          />
          <div className={`
            border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-all duration-500
            ${file ? "border-emerald-400/50 bg-emerald-400/5" : "border-white/10 hover:border-white/20 bg-white/[0.02]"}
          `}>
            {file ? (
              <>
                <Video className="text-emerald-400 mb-2" size={48} />
                <p className="text-white font-bold">{file.name}</p>
                <p className="text-zinc-500 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="text-zinc-400" size={24} />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">点击或拖拽视频上传</p>
                  <p className="text-zinc-500 text-xs mt-1">支持 MP4, MOV (建议 H.264)</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Previews */}
        <AnimatePresence>
          {thumbnailPreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  <ImageIcon size={14} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">自动提取的缩略图</span>
                </div>
                <div className="aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex flex-col justify-end pb-2">
                <p className="text-zinc-500 text-xs leading-relaxed italic">
                  * 我们已在客户端为您提取了视频第 1.0 秒的画面。这能减少服务器在上传时的 CPU 压力，有效防止超时报错。
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status & Progress */}
        <div className="space-y-4">
          {status === "uploading" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase text-emerald-400">
                <span>正在上传作品...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="p-4 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl flex items-center gap-3 text-emerald-400">
              <CheckCircle2 size={20} />
              <span className="text-sm font-bold">发布成功！作品已同步至官网。</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-2xl flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || status === "uploading" || status === "extracting"}
            className={`
              w-full py-4 rounded-2xl font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2
              ${!file || status === "uploading" || status === "extracting"
                ? "bg-white/5 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-400 text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(52,211,153,0.3)]"}
            `}
          >
            {status === "uploading" ? (
              <>
                <Loader2 className="animate-spin" size={18} /> 上传中...
              </>
            ) : (
              "开始发布作品"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
