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

// Send interactive card
async function sendFeishuCard(email: string, idCard: string, requestId: string, token: string) {
  const tokenAccess = await getFeishuAccessToken();
  const receiveId = process.env.FEISHU_OWNER_OPEN_ID;

  if (!receiveId) {
    throw new Error('Missing FEISHU_OWNER_OPEN_ID in environment');
  }

  const timeStr = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '📋 简历下载审批申请' },
      template: 'blue'
    },
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**申请人邮箱：** ${email}\n**申请人身份：** ${idCard}\n**申请时间：** ${timeStr}`
        }
      },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '✔️ 同意发送' },
            type: 'primary',
            value: {
              action: 'approve',
              requestId,
              token
            }
          },
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '❌ 拒绝发送' },
            type: 'danger',
            value: {
              action: 'reject',
              requestId,
              token
            }
          }
        ]
      }
    ]
  };

  const res = await fetch('https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenAccess}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      receive_id: receiveId,
      msg_type: 'interactive',
      content: JSON.stringify(card)
    })
  });

  const data = await res.json() as any;
  if (data.code !== 0) {
    throw new Error(`Failed to send Feishu message: ${data.msg}`);
  }
  return data.data.message_id;
}

// Nodemailer send email via Gmail
async function sendGmail(toEmail: string) {
  let transporter;

  const smtpUser = process.env.SMTP_USER; // e.g. xxx@gmail.com
  const smtpPass = process.env.SMTP_PASS; // App Password

  const gmailClientId = process.env.GMAIL_CLIENT_ID;
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (gmailRefreshToken && gmailClientId && gmailClientSecret) {
    // Option 2: OAuth2 authentication
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: smtpUser,
        clientId: gmailClientId,
        clientSecret: gmailClientSecret,
        refreshToken: gmailRefreshToken
      }
    });
  } else if (smtpUser && smtpPass) {
    // Option 1: App Password / standard SMTP authentication
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  } else {
    throw new Error('Email credentials not configured. Please set SMTP_USER/SMTP_PASS or GMAIL_REFRESH_TOKEN in backend environment.');
  }

  // PDF path on ECS server
  const pdfPath = '/var/www/strapi/public/uploads/resumes/wangchenyang-resume-2026.pdf';
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Resume PDF file not found at: ${pdfPath}`);
  }

  const mailOptions = {
    from: `"王晨阳" <${smtpUser}>`,
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

      // Send Feishu interactive card notification
      const messageId = await sendFeishuCard(email, idCard, record.documentId, secureToken);

      // Update record with Feishu message ID
      await strapi.documents('api::resume-request.resume-request').update({
        documentId: record.documentId,
        data: {
          feishuMessageId: messageId
        }
      });

      return ctx.send({ ok: true, message: 'Application submitted and awaiting approval' });
    } catch (err: any) {
      console.error('[Resume Request Apply Error]', err);
      return ctx.badRequest(err.message || 'Internal server error');
    }
  },

  async cardCallback(ctx: any) {
    const payload = ctx.request.body;

    // Check challenge request from Feishu if configuring URL for the first time
    if (payload.type === 'url_verification') {
      return ctx.send({ challenge: payload.challenge });
    }

    const actionValue = payload.action?.value;
    if (!actionValue) {
      return ctx.badRequest('Invalid card callback payload');
    }

    const { action, requestId, token } = actionValue;

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
                  content: `**申请人邮箱：** ${record.email}\n**申请人身份：** ${record.idCard}\n**处理状态：** 该申请在此前已处理，当前状态为: **${record.status}**`
                }
              }
            ]
          }
        });
      }

      const timeStr = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

      if (action === 'approve') {
        // 1. Send the email with pdf attachment
        await sendGmail(record.email);

        // 2. Update database record status to approved
        await strapi.documents('api::resume-request.resume-request').update({
          documentId: requestId,
          data: { status: 'approved' }
        });

        // 3. Return the approved card JSON to update Feishu card UI
        return ctx.send({
          card: {
            config: { wide_screen_mode: true },
            header: {
              title: { tag: 'plain_text', content: '📋 简历下载审批 - 已同意' },
              template: 'green'
            },
            elements: [
              {
                tag: 'div',
                text: {
                  tag: 'lark_md',
                  content: `**申请人邮箱：** ${record.email}\n**申请人身份：** ${record.idCard}\n**审批结果：** 🟢 已同意发送\n**发送时间：** ${timeStr}`
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
                  content: `**申请人邮箱：** ${record.email}\n**申请人身份：** ${record.idCard}\n**审批结果：** 🔴 已拒绝发送\n**处理时间：** ${timeStr}`
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
  }
}));
