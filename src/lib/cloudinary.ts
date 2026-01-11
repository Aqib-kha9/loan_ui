import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileString: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(fileString, {
      folder: 'loan_applicants',
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error('Image upload failed');
  }
};

export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl.includes('cloudinary.com')) return;

    // Extract public_id from URL
    // URL format: .../upload/v12345678/folder/filename.jpg
    const parts = imageUrl.split('/');
    const filename = parts.pop()?.split('.')[0]; // filename without extension
    const folder = parts.includes('loan_applicants') ? 'loan_applicants' : null;
    
    if (filename) {
        const publicId = folder ? `${folder}/${filename}` : filename;
        await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    // Suppress delete errors to avoid blocking main flow
  }
};
