const CONFIG = {
    API_URL: 'http://localhost:1337', // Strapi API
};

const db = {
    profile: {
        name: "",
        title: "",
        slogan: "",
        bio: "",
        bio_title: "",
        tags: [],
        intention: { role: "", salary: "", city: "" },
        contact: "",
        phone: "",
        skills: {
            labels: ['视频剪辑&包装', '创意策划', '投放数据分析', 'AI生图/视频', '3D视觉渲染', '文案脚本'],
            values: [95, 88, 92, 90, 75, 85]
        },
        software: [
            { name: "Ps", desc: "Photoshop", icon: '<div class="w-10 h-10 rounded shadow-md bg-[#001e36] border-2 border-[#31a8ff] text-[#31a8ff] flex items-center justify-center font-bold text-lg tracking-tighter select-none">Ps</div>' },
            { name: "Pr", desc: "Premiere Pro", icon: '<div class="w-10 h-10 rounded shadow-md bg-[#00005c] border-2 border-[#ea77ff] text-[#ea77ff] flex items-center justify-center font-bold text-lg tracking-tighter select-none">Pr</div>' },
            { name: "Ae", desc: "After Effects", icon: '<div class="w-10 h-10 rounded shadow-md bg-[#00005c] border-2 border-[#9999ff] text-[#9999ff] flex items-center justify-center font-bold text-lg tracking-tighter select-none">Ae</div>' },
            { name: "C4D", desc: "Cinema 4D", icon: '<div class="w-10 h-10 rounded-full shadow-md bg-gradient-to-b from-[#001438] to-[#0a3b85] text-white flex items-center justify-center font-black text-sm tracking-tighter select-none border border-white/20">C4D</div>' },
            { name: "MJ", desc: "Midjourney", icon: '<div class="w-10 h-10 rounded shadow-md bg-stone-900 text-white flex flex-col items-center justify-center font-serif italic text-lg border border-stone-700 select-none"><span class="leading-none">m</span><span class="leading-none -mt-1">j</span></div>' },
            { name: "SD", desc: "Stable Diffusion", icon: '<div class="w-10 h-10 rounded shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base ring-1 ring-white/20 select-none">SD</div>' }
        ],
        workExp: [],
        projects: [],
        edu: []
    },
    works: [
        { id: 9991, type: "video", title: "正在连接数据库...", spend: 0, roi: 0, ctr: "-", cvr: "-", platform: "-", game: "-", doc: "#" }
    ],
    articles: [
        { id: 9992, title: "正在连接数据库...", summary: "请稍候...", date: "..." }
    ]
};
