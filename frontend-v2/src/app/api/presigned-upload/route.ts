import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const R2_ENDPOINT = process.env.CF_ENDPOINT!;
const R2_BUCKET = process.env.CF_BUCKET!;
const R2_PUBLIC = process.env.CF_PUBLIC_DOMAIN!;

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CF_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_ACCESS_SECRET!,
  },
  forcePathStyle: true,
});

export async function POST(req: Request) {
  try {
    const { fileName, contentType } = await req.json();
    if (!fileName || !contentType) {
      return NextResponse.json({ error: "缺少 fileName 或 contentType" }, { status: 400 });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
    const key = `uploads/${datePrefix}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return NextResponse.json({
      uploadUrl,
      publicUrl: `${R2_PUBLIC}/${key}`,
      key,
    });
  } catch (err) {
    console.error("Presigned URL generation failed:", err);
    return NextResponse.json({ error: "生成上传链接失败" }, { status: 500 });
  }
}
