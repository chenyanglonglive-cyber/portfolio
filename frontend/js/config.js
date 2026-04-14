const CONFIG = {
    API_URL: 'http://localhost:1337', // Strapi API
};

const db = {
    profile: {
        name: "Rico",
        title: "买量广告视频设计师",
        slogan: "以数据驱动创意，用AI重塑工作流，专注打造百万级消耗的高ROI爆款素材。",
        bio: "拥有丰富的买量广告视觉设计与投放素材优化经验，专注于出海游戏及应用的增长业务。擅长将抽象的投放数据（如ROI、CTR、CVR）转化为直观的创意迭代策略。熟练掌握传统后期工作流（Pr、Ae、C4D），并深度整合了AI生成技术（Midjourney、Stable Diffusion），能独立完成从前期脚本策划、中期视觉表现到后期包装及A/B测试的完整素材生命周期。致力于用数据赋能创意，打造高转化的爆款视觉资产。",
        bio_title: "个人介绍",
        tags: ["高ROI操盘手", "AI视频流转", "爆款制造者"],
        intention: { role: "资深广告创意设计 / 投放创意BP", salary: "25k-35k", city: "广州 / 深圳" },
        contact: "rico.design@example.com",
        phone: "+86 138-8888-8888",
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
        workExp: [
            { time: "2023.05 - 至今", company: "某头部出海游戏发行商", role: "高级创意设计师", desc: "统筹北美区SLG产品素材产出，累计经手消耗突破 5000 万人民币。主导引入 AI 工作流，提升 40% 产能。" },
            { time: "2021.07 - 2023.05", company: "某知名买量代理公司", role: "广告视频设计师", desc: "负责信息流广告视频制作（抖音/快手/广点通），单条素材最高创造 300 万+ 利润，连续三个季度获评最佳创意。" }
        ],
        projects: [
            { time: "2024.01", name: "《CyberCity》北美S级首发视觉统筹", desc: "搭建全套素材模板体系，首日消耗破 20 万刀，7日ROI达 135%。" }
        ],
        edu: [
            { time: "2017.09 - 2021.06", school: "广州美术学院", major: "数字媒体艺术", degree: "本科", honor: "校级优秀毕业生" }
        ]
    },
    works: [
        { id: 9991, type: "video", title: "正在连接数据库...", spend: 0, roi: 0, ctr: "-", cvr: "-", platform: "-", game: "-", doc: "#" }
    ],
    articles: [
        { id: 9992, title: "正在连接数据库...", summary: "请稍候...", date: "..." }
    ]
};
