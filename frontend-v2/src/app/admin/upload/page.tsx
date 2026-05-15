import UploadForm from "./UploadForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AdminUploadPage() {
  return (
    <main className="container mx-auto px-8 py-20 min-h-screen">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-[10px] font-bold tracking-widest uppercase">
            <ChevronLeft size={14} /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            Rapid Upload <span className="text-emerald-400 not-italic ml-2">.极速发布</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl">
            使用客户端预处理技术，秒级上传视频作品，自动关联缩略图，告别服务器超时报错。
          </p>
        </div>
      </div>

      <UploadForm />
    </main>
  );
}
