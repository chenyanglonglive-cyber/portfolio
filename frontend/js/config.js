const CONFIG = {
    API_URL: 'http://localhost:1337', // Strapi API
};

const db = {
    profile: {
        name: "王晨阳",
        title: "资深广告创意设计师 / AI 工作流负责人",
        slogan: "9年深耕广告设计，以数据驱动创意，用 AI 重塑增长，专注百万级消耗高 ROI 爆款素材。",
        bio: "拥有 9 年买量广告创意背景，从动画专业毕业进阶为企业级 AI 发展负责人。擅长将 IP 沉淀与现代买量策略结合，创造单条消耗 510w+ 的行业标杆。深度钻研 AI 在视频流中的落地应用，主导企业级 AI 工作流搭建与团队赋能，具备从脚本策划、视觉表现到 AI 提效的全链路项目管理能力。",
        bio_title: "核心优势",
        tags: ["9年资深操盘", "AI 工作流负责人", "爆款素材专家"],
        intention: { role: "资深广告创意设计 / AI 数字化专家", salary: "25k-28k", city: "北京" },
        contact: "459361040@qq.com",
        phone: "+86 138-8888-8888",
        skills: {
            labels: ['合成制作剪辑', '创意策划', '投放数据分析', 'AI生图/视频', '3D视觉渲染', '文案脚本'],
            values: [96, 95, 92, 98, 30, 90]
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
            { time: "2023.09 - 2026.06.15", company: "北京爱乐游", role: "买量视频创意 / AI 发展负责人", desc: "核心负责买量视频创意、脚本撰写及视频制作，从单一素材产出逐步成长为公司 AI 发展负责人。深度参与海外及国内小游戏核心项目，具备全流程项目操盘与团队 AI 赋能能力。" },
            { time: "2021.07 - 2023.05", company: "某知名买量代理公司", role: "广告视频设计师", desc: "负责快手、抖音、广点通等多平台信息流视频制作。单条素材最高创造 300 万+ 利润，连续获得季度最佳项目奖项。" }
        ],
        projects: [
            { time: "2024.10", name: "《雷霆战机》10周年品牌焕新买量", desc: "主导“情怀向”策略吸引老用户回归。抖音消耗 510万+，单月最高 240万+，产出 10W+ 爆款素材十余条。单条贺炜诗意解说素材消耗 60万+（数据保持至今）。首日 ROI 20%，7天回本。" },
            { time: "2025.01", name: "公司级 AI 提效体系搭建（负责人）", desc: "调研并评估 AI 路径，设计视频制作全流程 AI 工作流并输出全员培训文档。推动 AI 在创意、美术及后期环节的落地应用，显著提升团队生产效率。" },
            { time: "2023.12", name: "海外益智问答系列（Trivia Bible / Movie Star）", desc: "独立负责全站设计师职责，精准定位北美及巴西市场。通过 MJ 制作高质量美术素材。项目月收入 3万美元，成功实现小团队运营成本全覆盖。" },
            { time: "2024.05", name: "微信小游戏《无敌冲冲冲》", desc: "负责核心角色技能动画制作、可复用公共素材输出。管理项目买量广告制作，协助实现 50万级规模的消耗覆盖。" }
        ],
        edu: [
            { time: "2011.09 - 2015.06", school: "成都大学", major: "动画", degree: "本科", honor: "2次 三好学生" }
        ]
    },
    works: [
        { id: 9991, type: "video", title: "正在连接数据库...", spend: 0, roi: 0, ctr: "-", cvr: "-", platform: "-", game: "-", doc: "#" }
    ],
    articles: [
        { id: 9992, title: "正在连接数据库...", summary: "请稍候...", date: "..." }
    ]
};
