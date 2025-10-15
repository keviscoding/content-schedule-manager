import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET || '';

export const generateUploadUrl = async (fileName: string, fileType: string): Promise<{ uploadUrl: string; key: string }> => {
  const key = `videos/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return { uploadUrl, key };
};

export const getFileUrl = (key: string): string => {
  if (process.env.S3_ENDPOINT) {
    return `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
  }
  return `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
};

export const generateViewUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const viewUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return viewUrl;
};

export const deleteFile = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

export const extractKeyFromUrl = (url: string): string => {
  // URL format: https://sfo3.digitaloceanspaces.com/content-manager-videos/videos/timestamp-filename.mp4
  // We need: videos/timestamp-filename.mp4
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname; // /content-manager-videos/videos/timestamp-filename.mp4
    
    // Remove leading slash and bucket name
    const parts = pathname.split('/').filter(Boolean); // ['content-manager-videos', 'videos', 'timestamp-filename.mp4']
    
    // Remove bucket name (first part) and join the rest
    const key = parts.slice(1).join('/'); // 'videos/timestamp-filename.mp4'
    
    return key;
  } catch (error) {
    // Fallback to old method if URL parsing fails
    console.error('Failed to parse URL:', url, error);
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/');
  }
};
