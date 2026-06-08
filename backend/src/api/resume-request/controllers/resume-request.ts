import { factories } from '@strapi/strapi';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Helper to fetch tenant access token
async function getFeishuAccessToken() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Missing FEISHU_APP_ID or FEISHU_APP_SECRET in environment');
  }

  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  });

  const data = await res.json() as any;
  if (data.code !== 0) {
    throw new Error(`Feishu auth failed: ${data.msg}`);
  }
  return data.tenant_access_token;
}

// 发送纯文本审批消息，包含直连 ECS 公网 IP 的审批超链接，规避备案和 3 秒回调限制
async function sendFeishuApplicationNotification(email: string, idCard: string, requestId: string, token: string) {
  const timeStr = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  // 审批链接采用直连公网 IP，完全绕开域名备案拦截限制
  const approveUrl = `http://47.95.242.40/api/feishu/approve?requestId=${requestId}&token=${token}`;
  const rejectUrl = `http://47.95.242.40/api/feishu/reject?requestId=${requestId}&token=${token}`;

  const text = `📋 新的简历下载审批申请\n====================\n申请人邮箱：${email}\n身份信息：${idCard}\n申请时间：${timeStr}\n\n【同意发送并给用户发邮件】：\n👉 ${approveUrl}\n\n【拒绝发送】：\n👉 ${rejectUrl}`;

  return sendFeishuTextMessage(text);
}

// 辅助函数：发送普通的飞书文本消息（用于审批结果回显和反馈）
async function sendFeishuTextMessage(text: string) {
  try {
    const tokenAccess = await getFeishuAccessToken();
    const receiveId = process.env.FEISHU_OWNER_OPEN_ID;
    if (!receiveId) return null;

    const res = await fetch('https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenAccess}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        receive_id: receiveId,
        msg_type: 'text',
        content: JSON.stringify({ text })
      })
    });
    const data = await res.json() as any;
    if (data.code !== 0) {
      throw new Error(`Failed to send Feishu text message: ${data.msg}`);
    }
    return data.data.message_id;
  } catch (err) {
    console.error('[Failed to send Feishu text message]', err);
    throw err;
  }
}

// 审批结果的飞书异步反馈
async function sendFeedbackNotification(email: string, idCard: string, action: 'approve' | 'reject', success: boolean, errorMsg?: string) {
  const timeStr = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  let text = '';
  if (action === 'approve') {
    if (success) {
      text = `✅ [审批反馈] 简历已成功投递！\n====================\n申请人邮箱：${email}\n身份信息：${idCard}\n处理结果：邮件已通过 SMTP 发送成功\n时间：${timeStr}`;
    } else {
      text = `❌ [审批反馈] 简历投递失败！\n====================\n申请人邮箱：${email}\n身份信息：${idCard}\n处理结果：发送邮件失败\n错误详情：${errorMsg || '未知错误'}\n时间：${timeStr}`;
    }
  } else {
    text = `🔴 [审批反馈] 简历申请已被拒绝。\n====================\n申请人邮箱：${email}\n身份信息：${idCard}\n处理结果：已拒绝发送\n时间：${timeStr}`;
  }
  return sendFeishuTextMessage(text);
}

// 通用 SMTP 发送邮件（支持 QQ Mail、163、Gmail 等任意服务商）
async function sendEmail(toEmail: string) {
  const host    = process.env.SMTP_HOST   || 'smtp.gmail.com';
  const port    = parseInt(process.env.SMTP_PORT  || '465', 10);
  const secure  = process.env.SMTP_SECURE !== 'false'; // 默认 true
  const user    = process.env.SMTP_USER;
  const pass    = process.env.SMTP_PASS;
  const pdfPath = process.env.RESUME_PDF_PATH
                  || '/var/www/strapi/public/uploads/resumes/wangchenyang-resume-2026.pdf';

  if (!user || !pass) {
    throw new Error('邮件凭证未配置，请在 ECS .env 中设置 SMTP_USER 和 SMTP_PASS。');
  }

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`简历 PDF 文件不存在：${pdfPath}`);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  const mailOptions = {
    from: `"王晨阳" <${user}>`,
    to: toEmail,
    subject: '王晨阳-游戏创意设计师简历',
    text: '您好，感谢您对我个人作品的关注。附件中是我的个人简历，请您查收。祝您工作顺利，生活愉快！',
    attachments: [
      {
        filename: '王晨阳-游戏创意2026.pdf',
        path: pdfPath
      }
    ]
  };

  return transporter.sendMail(mailOptions);
}

// 渲染漂亮的玻璃拟态审批反馈 HTML 页面
function renderFeedbackHtml(status: 'approved' | 'rejected' | 'failed' | 'already-processed' | 'error', email: string, idCard: string, currentStatus?: string, errorMsg?: string) {
  let title = '';
  let statusIcon = '';
  let statusIconClass = '';
  let statusText = '';
  let statusColor = '';
  let message = '';

  switch (status) {
    case 'approved':
      title = '审批通过';
      statusIcon = '✓';
      statusIconClass = 'success-icon';
      statusText = '已同意并发送';
      statusColor = 'var(--accent-success)';
      message = '简历已成功通过 SMTP 发送至申请人邮箱。';
      break;
    case 'rejected':
      title = '审批已拒绝';
      statusIcon = '✕';
      statusIconClass = 'error-icon';
      statusText = '已拒绝申请';
      statusColor = 'var(--accent-error)';
      message = '您已拒绝该简历下载申请。';
      break;
    case 'failed':
      title = '邮件发送失败';
      statusIcon = '⚠';
      statusIconClass = 'warning-icon';
      statusText = '邮件发送失败';
      statusColor = 'var(--accent-warning)';
      message = `审批已通过，但邮件发送失败。错误详情：${errorMsg || '未知错误'}`;
      break;
    case 'already-processed':
      const friendlyStatus = currentStatus === 'approved' ? '已同意' : currentStatus === 'rejected' ? '已拒绝' : currentStatus;
      title = '申请已处理';
      statusIcon = '⚠';
      statusIconClass = 'warning-icon';
      statusText = `已处理 (${friendlyStatus})`;
      statusColor = 'var(--accent-warning)';
      message = '此审批申请在此前已处理，无法重复操作。';
      break;
    default:
      title = '无效申请';
      statusIcon = '✕';
      statusIconClass = 'error-icon';
      statusText = '验证失败';
      statusColor = 'var(--accent-error)';
      message = '请求参数错误或该申请不存在。';
      break;
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Noto+Sans+SC:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      --card-bg: rgba(255, 255, 255, 0.03);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --accent-success: #10b981;
      --accent-error: #ef4444;
      --accent-warning: #f59e0b;
      --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Outfit', 'Noto Sans SC', sans-serif;
      background: var(--bg-gradient);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      perspective: 1000px;
    }
    
    .glass-card {
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 40px;
      width: 90%;
      max-width: 480px;
      text-align: center;
      box-shadow: var(--shadow);
      transform-style: preserve-3d;
      animation: cardFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes cardFadeIn {
      from {
        opacity: 0;
        transform: translateY(40px) rotateX(-10deg);
      }
      to {
        opacity: 1;
        transform: translateY(0) rotateX(0deg);
      }
    }
    
    .icon-container {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 40px;
      position: relative;
    }
    
    .icon-container::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      opacity: 0.15;
      animation: pulse 2s infinite;
    }
    
    .success-icon {
      color: var(--accent-success);
      border: 2px solid var(--accent-success);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
    }
    .success-icon::after {
      background: var(--accent-success);
    }
    
    .error-icon {
      color: var(--accent-error);
      border: 2px solid var(--accent-error);
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
    }
    .error-icon::after {
      background: var(--accent-error);
    }
    
    .warning-icon {
      color: var(--accent-warning);
      border: 2px solid var(--accent-warning);
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
    }
    .warning-icon::after {
      background: var(--accent-warning);
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 0.2;
      }
      70% {
        transform: scale(1.3);
        opacity: 0;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }
    
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
    
    p {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    
    .details {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: left;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    
    .detail-item:last-child {
      margin-bottom: 0;
    }
    
    .detail-label {
      color: var(--text-secondary);
    }
    
    .detail-val {
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .footer {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.2);
      margin-top: 32px;
    }
  </style>
</head>
<body>
  <div class="glass-card">
    <div class="icon-container ${statusIconClass}">${statusIcon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="details">
      <div class="detail-item">
        <span class="detail-label">申请人邮箱</span>
        <span class="detail-val">${email}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">身份信息</span>
        <span class="detail-val">${idCard}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">处理状态</span>
        <span class="detail-val" style="color: ${statusColor};">${statusText}</span>
      </div>
    </div>
    <div class="footer">
      Powered by Antigravity Studio © 2026
    </div>
  </div>
</body>
</html>`;
}

export default factories.createCoreController('api::resume-request.resume-request' as any, ({ strapi }: any) => ({
  async apply(ctx: any) {
    const { email, idCard } = ctx.request.body;

    if (!email || !idCard) {
      return ctx.badRequest('Missing email or idCard in request body');
    }

    // Basic regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ctx.badRequest('Invalid email address format');
    }

    // Basic verification for identity info
    if (typeof idCard !== 'string' || idCard.trim().length < 2) {
      return ctx.badRequest('Invalid identity info format');
    }

    try {
      const secureToken = crypto.randomBytes(32).toString('hex');

      // Create a pending record
      const record = await strapi.documents('api::resume-request.resume-request').create({
        data: {
          email,
          idCard,
          status: 'pending',
          token: secureToken
        },
        status: 'published'
      });

      // Send Feishu plain text notification with approve/reject links
      const messageId = await sendFeishuApplicationNotification(email, idCard, record.documentId, secureToken);

      // Update record with Feishu message ID
      if (messageId) {
        await strapi.documents('api::resume-request.resume-request').update({
          documentId: record.documentId,
          data: {
            feishuMessageId: messageId
          }
        });
      }

      return ctx.send({ ok: true, message: 'Application submitted and awaiting approval' });
    } catch (err: any) {
      console.error('[Resume Request Apply Error]', err);
      return ctx.badRequest(err.message || 'Internal server error');
    }
  },

  async cardCallback(ctx: any) {
    const payload = ctx.request.body;
    console.log('[Feishu Callback Payload]', JSON.stringify(payload, null, 2));

    // Check challenge request from Feishu if configuring URL for the first time
    if (payload.type === 'url_verification') {
      return ctx.send({ challenge: payload.challenge });
    }

    let actionValue = payload.action?.value || payload.event?.action?.value;
    if (typeof actionValue === 'string') {
      try {
        actionValue = JSON.parse(actionValue);
      } catch (e: any) {
        console.error('[Feishu Callback] Failed to parse actionValue JSON string:', e.message);
      }
    }

    if (!actionValue) {
      return ctx.badRequest('Invalid card callback payload');
    }

    const { action, requestId, token } = actionValue;
    console.log('[Feishu Callback Action]', { action, requestId, token });

    try {
      // Find the record
      const record = await strapi.documents('api::resume-request.resume-request').findOne({
        documentId: requestId
      });

      if (!record) {
        return ctx.badRequest('Request record not found');
      }

      if (record.token !== token) {
        return ctx.badRequest('Invalid verification token');
      }

      if (record.status !== 'pending') {
        // Return already processed card layout
        return ctx.send({
          card: {
            config: { wide_screen_mode: true },
            header: {
              title: { tag: 'plain_text', content: '📋 简历下载审批 - 已处理' },
              template: 'grey'
            },
            elements: [
              {
                tag: 'div',
                text: {
                  tag: 'lark_md',
                  content: `**申请人邮箱：** ${record.email}\n**发给谁：** ${record.idCard}\n**处理状态：** 该申请在此前已处理，当前状态为: **${record.status}**`
                }
              }
            ]
          }
        });
      }

      const timeStr = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

      if (action === 'approve') {
        // 异步在后台执行邮件发送和状态更新，避免阻塞飞书回调（3秒超时限制）
        (async () => {
          try {
            await sendEmail(record.email);
            await strapi.documents('api::resume-request.resume-request').update({
              documentId: requestId,
              data: { status: 'approved' }
            });
            console.log(`[Feishu Callback Async] Successfully sent email to ${record.email} and updated status to approved.`);
            sendFeedbackNotification(record.email, record.idCard, 'approve', true).catch(err => {
              console.error('[Async Feedback Error]', err);
            });
          } catch (e: any) {
            console.error(`[Feishu Callback Async Error]`, e);
            // 失败时将数据库状态更新为 failed，以便后续排查
            await strapi.documents('api::resume-request.resume-request').update({
              documentId: requestId,
              data: { status: 'failed' }
            });
            sendFeedbackNotification(record.email, record.idCard, 'approve', false, e.message || '邮件发送失败').catch(err => {
              console.error('[Async Feedback Error]', err);
            });
          }
        })();

        // 3. Return the approved card JSON to update Feishu card UI immediately
        return ctx.send({
          card: {
            config: { wide_screen_mode: true },
            header: {
              title: { tag: 'plain_text', content: '📋 简历下载审批 - 已同意' },
              template: 'blue'
            },
            elements: [
              {
                tag: 'div',
                text: {
                  tag: 'lark_md',
                  content: `**申请人邮箱：** ${record.email}\n**发给谁：** ${record.idCard}\n**审批结果：** 已同意发送\n**处理时间：** ${timeStr}`
                }
              }
            ]
          }
        });
      } else if (action === 'reject') {
        // 1. Update database record status to rejected
        await strapi.documents('api::resume-request.resume-request').update({
          documentId: requestId,
          data: { status: 'rejected' }
        });

        sendFeedbackNotification(record.email, record.idCard, 'reject', true).catch(err => {
          console.error('[Async Feedback Error]', err);
        });

        // 2. Return the rejected card JSON to update Feishu card UI
        return ctx.send({
          card: {
            config: { wide_screen_mode: true },
            header: {
              title: { tag: 'plain_text', content: '📋 简历下载审批 - 已拒绝' },
              template: 'red'
            },
            elements: [
              {
                tag: 'div',
                text: {
                  tag: 'lark_md',
                  content: `**申请人邮箱：** ${record.email}\n**发给谁：** ${record.idCard}\n**审批结果：** 🔴 已拒绝发送\n**处理时间：** ${timeStr}`
                }
              }
            ]
          }
        });
      }

      return ctx.badRequest('Unknown action type');
    } catch (err: any) {
      console.error('[Feishu Card Callback Error]', err);
      return ctx.send({
        card: {
          config: { wide_screen_mode: true },
          header: {
            title: { tag: 'plain_text', content: '📋 简历下载审批 - 处理出错' },
            template: 'red'
          },
          elements: [
            {
              tag: 'div',
              text: {
                tag: 'lark_md',
                content: `**处理错误：** ❌ ${err.message || '邮件发送失败或配置有误'}`
              }
            }
          ]
        }
      });
    }
  },

  async approveLink(ctx: any) {
    const { requestId, token } = ctx.query;

    if (!requestId || !token) {
      ctx.type = 'text/html';
      ctx.body = renderFeedbackHtml('error', '未知', '未知');
      return;
    }

    try {
      const record = await strapi.documents('api::resume-request.resume-request').findOne({
        documentId: requestId
      });

      if (!record) {
        ctx.type = 'text/html';
        ctx.body = renderFeedbackHtml('error', '未知', '未知');
        return;
      }

      if (record.token !== token) {
        ctx.type = 'text/html';
        ctx.body = renderFeedbackHtml('error', record.email, record.idCard);
        return;
      }

      if (record.status !== 'pending') {
        ctx.type = 'text/html';
        ctx.body = renderFeedbackHtml('already-processed', record.email, record.idCard, record.status);
        return;
      }

      try {
        await sendEmail(record.email);

        await strapi.documents('api::resume-request.resume-request').update({
          documentId: requestId,
          data: { status: 'approved' }
        });

        // 异步发送飞书状态通知
        sendFeedbackNotification(record.email, record.idCard, 'approve', true).catch(err => {
          console.error('[Async Feedback Error]', err);
        });

        ctx.type = 'text/html';
        ctx.body = renderFeedbackHtml('approved', record.email, record.idCard);
      } catch (emailErr: any) {
        console.error('[SMTP Send Email Error]', emailErr);

        await strapi.documents('api::resume-request.resume-request').update({
          documentId: requestId,
          data: { status: 'failed' }
        });

        // 异步发送飞书状态通知 (失败)
        sendFeedbackNotification(record.email, record.idCard, 'approve', false, emailErr.message || 'SMTP 发送失败').catch(err => {
          console.error('[Async Feedback Error]', err);
        });

        ctx.type = 'text/html';
        ctx.body = renderFeedbackHtml('failed', record.email, record.idCard, undefined, emailErr.message || 'SMTP 发送失败');
      }
    } catch (err: any) {
      console.error('[Approve Link Error]', err);
      ctx.type = 'text/html';
      ctx.body = renderFeedbackHtml('error', '未知', '未知');
    }
  },

  async rejectLink(ctx: any) {
    const { requestId, token } = ctx.query;

    if (!requestId || !token) {
      ctx.type = 'text/html';
      ctx.body = renderFeedbackHtml('error', '未知', '未知');
      return;
    }

    try {
      const record = await strapi.documents('api::resume-request.resume-request').findOne({
        documentId: requestId
      });

      if (!record) {
        ctx.type = 'text/html';
        ctx.body = renderFeedbackHtml('error', '未知', '未知');
        return;
      }

      if (record.token !== token) {
        ctx.type = 'text/html';
        ctx.body = renderFeedbackHtml('error', record.email, record.idCard);
        return;
      }

      if (record.status !== 'pending') {
        ctx.type = 'text/html';
        ctx.body = renderFeedbackHtml('already-processed', record.email, record.idCard, record.status);
        return;
      }

      await strapi.documents('api::resume-request.resume-request').update({
        documentId: requestId,
        data: { status: 'rejected' }
      });

      // 异步发送飞书拒绝状态通知
      sendFeedbackNotification(record.email, record.idCard, 'reject', true).catch(err => {
        console.error('[Async Feedback Error]', err);
      });

      ctx.type = 'text/html';
      ctx.body = renderFeedbackHtml('rejected', record.email, record.idCard);
    } catch (err: any) {
      console.error('[Reject Link Error]', err);
      ctx.type = 'text/html';
      ctx.body = renderFeedbackHtml('error', '未知', '未知');
    }
  }
}));
