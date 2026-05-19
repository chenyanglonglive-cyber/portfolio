"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Shrink, FileImage } from "lucide-react";
import { uploadToStrapi, createVideoEntry, createImageEntry, compressAndUploadVideo } from "./actions";
import { compressImageToWebP } from "@/lib/compress";

type Mode = "video" | "image";
type Status = "idle" | "extracting" | "compressing" | "uploading" | "success" | "error";

export default function UploadForm() {
  const [mode, setMode] = useState<Mode>("video");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    original: number;
    compressed: number;
  } | null>(null);
  const [title, setTitle] = useState("");

  // ── mode switch ──────────────────────────────────────────────────
  const handleModeSwitch = (newMode: Mode) => {
    if (status === "uploading") return;
    setMode(newMode);
    setFile(null);
    setThumbnail(null);
    setThumbnailPreview(null);
    setCompressedFile(null);
    setStatus("idle");
    setProgress(0);
    setStageText("");
    setError(null);
    setCompressionStats(null);
    setTitle("");
  };

  // ── file selection ───────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^.]+$/, ""));
    setError(null);
    setCompressionStats(null);
    setThumbnailPreview(null);

    if (mode === "video") {
      if (!selectedFile.type.startsWith("video/")) return;
      setStatus("extracting");
      try {
        const thumb = await extractAndCompressThumbnail(selectedFile);
        setThumbnail(thumb);
        setThumbnailPreview(URL.createObjectURL(thumb));
        setStatus("idle");
      } catch (err) {
        console.error("Thumbnail failed:", err);
        setStatus("idle");
        setError("缩略图提取失败，请检查视频格式");
      }
    } else {
      // Image: compress to WebP immediately
      setStatus("compressing");
      try {
        const result = await compressImageToWebP(selectedFile);
        setCompressedFile(result.file);
        setThumbnailPreview(URL.createObjectURL(result.file));
        setCompressionStats({
          original: result.originalSize,
          compressed: result.compressedSize,
        });
        setStatus("idle");
      } catch (err) {
        console.error("Image compression failed:", err);
        setStatus("idle");
        setError("图片压缩失败，请检查图片格式");
      }
    }
  };

  // ── thumbnail: capture frame → compress to WebP ──────────────────
  const extractAndCompressThumbnail = async (videoFile: File): Promise<File> => {
    const rawThumb = await captureFrame(videoFile, 1.0);
    const result = await compressImageToWebP(rawThumb, { min: 80, max: 180 });
    setCompressionStats({
      original: rawThumb.size,
      compressed: result.compressedSize,
    });
    return result.file;
  };

  const captureFrame = (videoFile: File, timeSec: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const url = URL.createObjectURL(videoFile);
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(timeSec, video.duration || timeSec);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx && canvas.width > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              if (blob) {
                resolve(new File([blob], "thumb.png", { type: "image/png" }));
              } else {
                reject(new Error("Canvas toBlob returned null"));
              }
            },
            "image/png"
          );
        } else {
          URL.revokeObjectURL(url);
          reject(new Error("Canvas context or zero-size frame"));
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Video failed to load"));
      };
    });
  };

  // ── submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    if (mode === "video" && !thumbnail) return;
    if (mode === "image" && !compressedFile) return;

    setStatus("uploading");
    setError(null);
    setProgress(0);

    try {
      if (mode === "video") {
        await submitVideoPipeline();
      } else {
        await submitImagePipeline();
      }
      setProgress(100);
      setStageText("发布成功！作品已同步至官网。");
      setStatus("success");
    } catch (err: any) {
      setError(err.message || "上传过程中发生错误");
      setStatus("error");
    }
  };

  // ── video pipeline: thumb upload → compress+upload video → create entry ──
  const submitVideoPipeline = async () => {
    if (!thumbnail || !file) return;

    // Stage 1: upload thumbnail
    setProgress(5);
    setStageText("正在上传压缩后的缩略图...");
    const thumbFD = new FormData();
    thumbFD.append("files", thumbnail);
    const thumbData = await uploadToStrapi(thumbFD);

    // Stage 2: upload video to ECS compression endpoint
    setProgress(15);
    setStageText("正在上传视频至压缩服务（ECS FFmpeg H.264 CRF 23）...");

    const videoFD = new FormData();
    videoFD.append("files", file);
    // Simulate intermediate progress since server action is opaque
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        // Slow progress ramp during upload+compress
        if (prev < 40) return prev + 2;
        if (prev < 70) return prev + 1;
        return prev + 0.5;
      });
      setStageText((prev) => {
        if (prev.includes("压缩")) return prev;
        return "正在压缩视频（FFmpeg H.264 CRF 23）...";
      });
    }, 800);

    let videoData: { id: number; url: string };
    try {
      videoData = await compressAndUploadVideo(videoFD);
    } finally {
      clearInterval(progressInterval);
    }

    // Stage 3: create entry
    setProgress(90);
    setStageText("正在创建作品条目...");

    await createVideoEntry({
      title,
      videoId: videoData.id,
      coverId: thumbData.id,
    });
  };

  // ── image pipeline: upload compressed image → create entry ──
  const submitImagePipeline = async () => {
    if (!compressedFile) return;

    setProgress(10);
    setStageText("正在上传压缩后的 WebP 图片...");

    const imageFD = new FormData();
    imageFD.append("files", compressedFile);
    const imageData = await uploadToStrapi(imageFD);

    setProgress(85);
    setStageText("正在创建作品条目...");

    await createImageEntry({ title, imageId: imageData.id });
  };

  // ── helpers ──────────────────────────────────────────────────────
  const isBusy = status === "uploading" || status === "extracting" || status === "compressing";
  const acceptStr = mode === "video" ? "video/*" : "image/*";
  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : "";

  const modeIcon = mode === "video" ? <Video size={48} /> : <ImageIcon size={48} />;
  const ModeIcon = mode === "video" ? Video : ImageIcon;

  // ── render ───────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-8 bg-zinc-900/50 rounded-3xl border border-white/5 backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Mode Toggle ─────────────────────────────────────────── */}
        <div className="flex gap-2">
          {(["video", "image"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeSwitch(m)}
              disabled={isBusy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                mode === m
                  ? "bg-emerald-400/10 border border-emerald-400/30 text-emerald-400"
                  : "bg-white/5 border border-white/5 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {m === "video" ? <Video size={14} /> : <ImageIcon size={14} />}
              {m === "video" ? "视频作品" : "图片作品"}
            </button>
          ))}
        </div>

        {/* ── Title ───────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            作品名称
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
            placeholder="输入作品标题"
            required
            disabled={isBusy}
          />
        </div>

        {/* ── Upload Zone ─────────────────────────────────────────── */}
        <div className="relative group">
          <input
            type="file"
            accept={acceptStr}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isBusy}
          />
          <div
            className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-all duration-500 ${
              file
                ? "border-emerald-400/50 bg-emerald-400/5"
                : "border-white/10 hover:border-white/20 bg-white/[0.02]"
            }`}
          >
            {file ? (
              <>
                <span className="text-emerald-400">{modeIcon}</span>
                <p className="text-white font-bold">{file.name}</p>
                <p className="text-zinc-500 text-sm">{fileSizeMB} MB</p>
                {status === "extracting" && (
                  <p className="text-emerald-400 text-xs animate-pulse flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    正在提取视频缩略图...
                  </p>
                )}
                {status === "compressing" && (
                  <p className="text-emerald-400 text-xs animate-pulse flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    正在压缩为 WebP...
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="text-zinc-400" size={24} />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">
                    点击或拖拽{mode === "video" ? "视频" : "图片"}上传
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {mode === "video"
                      ? "支持 MP4, MOV（上传后自动 FFmpeg 压缩）"
                      : "支持 JPG, PNG（自动压缩为 WebP 100-200KB）"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Preview + Compression Stats ─────────────────────────── */}
        <AnimatePresence>
          {thumbnailPreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  {mode === "video" ? <ImageIcon size={14} /> : <FileImage size={14} />}
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    {mode === "video" ? "缩略图预览（WebP 压缩后）" : "压缩后预览（WebP）"}
                  </span>
                </div>
                <div
                  className={`rounded-2xl overflow-hidden border border-white/10 bg-black ${
                    mode === "video" ? "aspect-[9/16]" : "aspect-video"
                  }`}
                >
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end gap-4 pb-2">
                {compressionStats && (
                  <div className="space-y-2 p-4 bg-emerald-400/5 rounded-xl border border-emerald-400/10">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Shrink size={14} />
                      <span className="text-[10px] font-bold tracking-widest uppercase">
                        压缩统计
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 space-y-1 font-mono">
                      <p>
                        原始大小:{" "}
                        <span className="text-white">
                          {(compressionStats.original / 1024).toFixed(1)} KB
                        </span>
                      </p>
                      <p>
                        压缩后:{" "}
                        <span className="text-emerald-400">
                          {(compressionStats.compressed / 1024).toFixed(1)} KB
                        </span>
                      </p>
                      <p>
                        压缩率:{" "}
                        <span className="text-emerald-400">
                          {(
                            (1 - compressionStats.compressed / compressionStats.original) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {mode === "video" && (
                  <p className="text-zinc-500 text-xs leading-relaxed italic">
                    * 已从视频第 1 秒提取画面并压缩为 WebP。
                    {" "}视频上传后将通过 ECS FFmpeg（H.264 CRF 23）二次压缩以保证码率一致性。
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Progress ────────────────────────────────────────────── */}
        <div className="space-y-4">
          {status === "uploading" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" />
                  {stageText || "正在处理..."}
                </span>
                <span className="text-emerald-400">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="p-4 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl flex items-center gap-3 text-emerald-400">
              <CheckCircle2 size={20} />
              <span className="text-sm font-bold">{stageText}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-2xl flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          {/* ── Submit ────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={!file || isBusy}
            className={`w-full py-4 rounded-2xl font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              !file || isBusy
                ? "bg-white/5 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-400 text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(52,211,153,0.3)]"
            }`}
          >
            {isBusy ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {status === "extracting"
                  ? "提取缩略图中..."
                  : status === "compressing"
                  ? "压缩中..."
                  : "上传中..."}
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
