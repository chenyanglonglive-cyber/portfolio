from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(__file__).resolve().parent
FONT = Path(r"C:\Windows\Fonts\msyh.ttc")
FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")

BG1 = (251, 250, 247)
BG2 = (247, 251, 255)
TEXT = (32, 35, 50)
MUTED = (113, 119, 134)
FAINT = (154, 163, 178)
ACCENT = (59, 130, 246)
BORDER = (230, 233, 239)
WHITE = (255, 255, 255)


def font(size, bold=False):
    path = FONT_BOLD if bold and FONT_BOLD.exists() else FONT
    return ImageFont.truetype(str(path), size)


def page_bg(width, height):
    image = Image.new("RGB", (width, height), BG1)
    pixels = image.load()
    for y in range(height):
        vertical = y / (height - 1)
        for x in range(width):
            horizontal = x / (width - 1)
            amount = (vertical + horizontal) / 2
            pixels[x, y] = tuple(int(BG1[i] * (1 - amount) + BG2[i] * amount) for i in range(3))
    return image.convert("RGBA")


def shadow_rect(base, box, radius, fill=(255, 255, 255, 205), outline=BORDER, blur=24, offset=(0, 16)):
    x1, y1, x2, y2 = box
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.rounded_rectangle(
        (x1 + offset[0], y1 + offset[1], x2 + offset[0], y2 + offset[1]),
        radius,
        fill=(100, 116, 139, 28),
    )
    base.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(blur)))
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(box, radius, fill=fill, outline=outline, width=1)
    return draw


def soft_rect(draw, box, radius, fill=(255, 255, 255, 170), outline=BORDER):
    draw.rounded_rectangle(box, radius, fill=fill, outline=outline, width=1)


def nav(draw, active):
    draw.rounded_rectangle((104, 34, 1336, 108), 37, fill=(255, 255, 255, 188), outline=(232, 235, 241), width=1)
    draw.ellipse((124, 48, 170, 94), fill=TEXT)
    draw.text((181, 58), "王晨阳", fill=TEXT, font=font(20, True))
    for name, x in [("首页", 908), ("简历", 983), ("作品", 1058)]:
        color = ACCENT if name == active else MUTED
        draw.text((x, 58), name, fill=color, font=font(17, True))
        if name == active:
            draw.rounded_rectangle((x - 6, 91, x + 37, 94), 2, fill=ACCENT)
    draw.rounded_rectangle((1184, 48, 1295, 94), 23, fill=TEXT)
    draw.text((1214, 59), "联系我", fill=WHITE, font=font(16, True))


def draw_home():
    image = page_bg(1440, 1100)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((900, -60, 1340, 380), fill=(219, 234, 254, 92))
    draw.ellipse((-40, 610, 480, 1130), fill=(245, 243, 255, 120))
    nav(draw, "首页")

    shadow_rect(image, (142, 188, 1298, 626), 34)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((188, 234, 296, 342), fill=(219, 234, 254, 230), outline=(215, 228, 246))
    draw.ellipse((224, 260, 260, 296), fill=(32, 35, 50, 220))
    draw.pieslice((202, 278, 282, 368), 180, 360, fill=(32, 35, 50, 220))
    draw.text((326, 252), "Hi, I'm Alessio", fill=FAINT, font=font(16, True))
    draw.text((326, 306), "王晨阳", fill=TEXT, font=font(66, True))
    draw.text((326, 382), "资深广告创意设计师 / AI 工作流负责人", fill=TEXT, font=font(34, True))
    draw.text((326, 442), "把买量创意、数据复盘与 AI 工作流串成一套更高效的增长系统。", fill=MUTED, font=font(24))
    draw.text((326, 486), "专注视频素材、图片广告、项目复盘与团队提效。", fill=MUTED, font=font(24))
    for text, x, width, is_accent in [
        ("9 年经验", 326, 128, True),
        ("AI Workflow", 470, 174, False),
        ("高 ROI 素材", 660, 156, False),
    ]:
        draw.rounded_rectangle((x, 530, x + width, 572), 21, fill=(248, 250, 252, 230), outline=BORDER)
        draw.text((x + 25, 540), text, fill=ACCENT if is_accent else MUTED, font=font(15, True))

    draw.rounded_rectangle((962, 250, 1214, 542), 28, fill=(248, 251, 255, 230), outline=(223, 231, 243))
    points = [(994, 466), (1056, 390), (1123, 374), (1188, 315)]
    draw.line(points, fill=ACCENT, width=4, joint="curve")
    for x, y in points:
        draw.ellipse((x - 7, y - 7, x + 7, y + 7), fill=ACCENT)
    draw.text((994, 292), "Current focus", fill=FAINT, font=font(15, True))
    draw.text((994, 512), "Creative systems for growth", fill=TEXT, font=font(18, True))

    draw.text((142, 694), "精选作品", fill=TEXT, font=font(34, True))
    draw.text((142, 736), "从投放数据、创意质量和复盘价值中挑选的代表项目。", fill=MUTED, font=font(18))
    cards = [
        ("战机仓库轮播", "视频素材 · 510w+ 消耗", (234, 242, 255)),
        ("赛博都市宣传片", "视频创意 · 复盘完整", (243, 244, 246)),
        ("奇幻世界观设定", "文章策划 · 创意沉淀", (255, 247, 237)),
    ]
    for index, (title, subtitle, color) in enumerate(cards):
        x = 142 + index * 400
        y = 780
        soft_rect(draw, (x, y, x + 356, y + 244), 26)
        draw.rounded_rectangle((x + 22, y + 22, x + 334, y + 148), 20, fill=color)
        if index == 0:
            draw.line([(x + 48, y + 122), (x + 96, y + 62), (x + 138, y + 94), (x + 178, y + 54), (x + 224, y + 8), (x + 312, y + 30)], fill=ACCENT, width=3)
        elif index == 1:
            for cx, color in [(102, (219, 234, 254)), (178, (224, 231, 255)), (254, (248, 250, 252))]:
                draw.ellipse((x + cx - 38, y + 48, x + cx + 38, y + 124), fill=color)
        else:
            draw.polygon([(x + 52, y + 126), (x + 132, y + 52), (x + 198, y + 118), (x + 236, y + 82), (x + 310, y + 126)], fill=(254, 215, 170))
        draw.text((x + 24, y + 177), title, fill=TEXT, font=font(24, True))
        draw.text((x + 24, y + 212), subtitle, fill=MUTED, font=font(17))
    draw.text((142, 1046), "© 2026 Alessio · Portfolio powered by Next.js, Strapi, R2 and Neon", fill=FAINT, font=font(17))
    image.convert("RGB").save(OUT / "home-shiro-style.png", quality=95)


def draw_works():
    image = page_bg(1440, 1180)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((930, 0, 1450, 520), fill=(219, 234, 254, 72))
    draw.ellipse((-50, 660, 470, 1180), fill=(245, 243, 255, 96))
    nav(draw, "作品")
    draw.text((142, 180), "Works / Case Studies", fill=FAINT, font=font(15, True))
    draw.text((142, 240), "作品展示", fill=TEXT, font=font(58, True))
    draw.text((142, 302), "把素材表现、投放数据和复盘结论放在同一个安静的阅读环境里。", fill=MUTED, font=font(22))
    for text, x, width, active in [("全部", 142, 76, True), ("视频素材", 232, 108, False), ("图片素材", 354, 108, False), ("文章复盘", 476, 108, False)]:
        draw.rounded_rectangle((x, 350, x + width, 392), 21, fill=TEXT if active else WHITE, outline=BORDER)
        draw.text((x + 24, 359), text, fill=WHITE if active else MUTED, font=font(15, True))

    works = [
        ("战机仓库轮播", "视频素材 · 雷霆战机 · ROI 复盘", "510w+ 消耗", (234, 242, 255)),
        ("赛博都市宣传片", "视频创意 · 双车叙事 · 高点击", "2.1k 收藏", (243, 244, 246)),
        ("机甲战士海报设计", "图片素材 · 视觉方向 · 批量产出", "256 次引用", (255, 247, 237)),
    ]
    for index, (title, subtitle, metric, color) in enumerate(works):
        x = 142 + index * 400
        y = 444
        shadow_rect(image, (x, y, x + 360, y + 318), 28)
        draw = ImageDraw.Draw(image, "RGBA")
        draw.rounded_rectangle((x + 22, y + 22, x + 338, y + 184), 20, fill=color)
        if index == 0:
            draw.line([(x + 50, y + 140), (x + 92, y + 84), (x + 140, y + 108), (x + 185, y + 64), (x + 235, y + 16), (x + 316, y + 46)], fill=ACCENT, width=4)
        elif index == 1:
            for cx, color in [(100, (219, 234, 254)), (180, (224, 231, 255)), (260, (248, 250, 252))]:
                draw.ellipse((x + cx - 42, y + 58, x + cx + 42, y + 142), fill=color)
        else:
            draw.polygon([(x + 52, y + 146), (x + 132, y + 66), (x + 194, y + 126), (x + 240, y + 90), (x + 314, y + 146)], fill=(254, 215, 170))
        draw.text((x + 24, y + 219), title, fill=TEXT, font=font(28, True))
        draw.text((x + 24, y + 256), subtitle, fill=MUTED, font=font(17))
        draw.text((x + 24, y + 290), metric, fill=ACCENT, font=font(15, True))

    for index, (title, subtitle, metric) in enumerate([
        ("奇幻世界观设定", "从世界观、角色阵营和广告切入点做统一规划。", "文章策划 · 2025"),
        ("AI 视频工作流", "把脚本、分镜、生成、剪辑和复盘串成生产线。", "流程沉淀 · 团队提效"),
    ]):
        x = 142 + index * 604
        y = 812
        shadow_rect(image, (x, y, x + 560, y + 188), 28)
        draw = ImageDraw.Draw(image, "RGBA")
        draw.rounded_rectangle((x + 22, y + 22, x + 168, y + 166), 20, fill=(237, 242, 255) if index == 0 else (248, 250, 252))
        draw.text((x + 198, y + 52), title, fill=TEXT, font=font(28, True))
        draw.text((x + 198, y + 92), subtitle, fill=MUTED, font=font(17))
        draw.text((x + 198, y + 132), metric, fill=ACCENT, font=font(15, True))
    image.convert("RGB").save(OUT / "works-shiro-style.png", quality=95)


def draw_resume():
    image = page_bg(1440, 1500)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((924, 20, 1444, 540), fill=(219, 234, 254, 64))
    draw.ellipse((-40, 880, 560, 1480), fill=(245, 243, 255, 88))
    nav(draw, "简历")
    shadow_rect(image, (142, 178, 1298, 454), 34)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((194, 232, 310, 348), fill=(219, 234, 254, 230), outline=(215, 228, 246))
    draw.ellipse((233, 260, 271, 298), fill=(32, 35, 50, 220))
    draw.pieslice((210, 280, 294, 370), 180, 360, fill=(32, 35, 50, 220))
    draw.text((348, 250), "Resume / Creative Growth", fill=FAINT, font=font(15, True))
    draw.text((348, 308), "王晨阳", fill=TEXT, font=font(56, True))
    draw.text((348, 378), "资深广告创意设计师 / AI 工作流负责人", fill=MUTED, font=font(21))
    draw.text((348, 416), "北京 · 459361040@qq.com · 9 年广告设计与买量创意经验", fill=MUTED, font=font(17))
    draw.rounded_rectangle((1014, 256, 1204, 312), 28, fill=TEXT)
    draw.text((1057, 271), "下载 PDF", fill=WHITE, font=font(18, True))

    shadow_rect(image, (142, 526, 498, 848), 30)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.text((168, 560), "技能矩阵", fill=TEXT, font=font(30, True))
    for index, (name, value) in enumerate([("创意策划", 0.93), ("AI 生图/视频", 0.96), ("投放数据分析", 0.86), ("合成剪辑", 0.9)]):
        y = 612 + index * 64
        draw.text((168, y), name, fill=MUTED, font=font(17))
        draw.rounded_rectangle((168, y + 28, 472, y + 36), 4, fill=(237, 242, 247))
        draw.rounded_rectangle((168, y + 28, 168 + int(304 * value), y + 36), 4, fill=ACCENT)

    shadow_rect(image, (542, 526, 1298, 848), 30)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.text((572, 560), "个人简介", fill=TEXT, font=font(30, True))
    lines = [
        "拥有 9 年买量广告创意背景，从动画专业毕业进阶为企业级 AI 发展负责人。",
        "擅长将 IP 沉淀、投放数据与现代买量策略结合，创造百万级消耗素材。",
        "主导 AI 视频工作流搭建、团队培训和创意生产流程优化。",
    ]
    for index, line in enumerate(lines):
        draw.text((572, 610 + index * 40), line, fill=MUTED, font=font(21))
    for index, text in enumerate(["爆款素材", "AI 工作流", "数据复盘"]):
        x = 572 + index * 136
        draw.rounded_rectangle((x, 752, x + 116, 794), 21, fill=(239, 246, 255) if index == 0 else (248, 250, 252), outline=BORDER)
        draw.text((x + 24, 762), text, fill=ACCENT if index == 0 else MUTED, font=font(15, True))

    shadow_rect(image, (142, 918, 1298, 1314), 30)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.text((172, 958), "核心项目", fill=TEXT, font=font(30, True))
    draw.line((190, 1014, 190, 1254), fill=BORDER, width=1)
    projects = [
        ("2024.10", "《雷霆战机》10 周年品牌焕新买量", "主导情怀向策略，抖音消耗 510 万+，沉淀多条 10W+ 爆款素材。"),
        ("2025.01", "公司级 AI 提效体系搭建", "设计视频制作全流程 AI 工作流，输出培训文档并推动团队落地。"),
    ]
    for index, (time, title, desc) in enumerate(projects):
        y = 1036 + index * 110
        draw.ellipse((183, y - 7, 197, y + 7), fill=ACCENT)
        draw.text((220, y - 12), time, fill=ACCENT, font=font(15, True))
        draw.text((220, y + 18), title, fill=TEXT, font=font(22, True))
        draw.text((220, y + 54), desc, fill=MUTED, font=font(17))
    draw.text((142, 1360), "工作经历 · 北京爱乐游 / 买量视频创意 / AI 发展负责人", fill=FAINT, font=font(17))
    draw.text((142, 1398), "教育经历 · 成都大学 动画 本科", fill=FAINT, font=font(17))
    image.convert("RGB").save(OUT / "resume-shiro-style.png", quality=95)


if __name__ == "__main__":
    draw_home()
    draw_works()
    draw_resume()
