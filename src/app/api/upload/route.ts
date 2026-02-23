import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
        }

        const url = await uploadToCloudinary(image);

        return NextResponse.json({ success: true, url });
    } catch (error: unknown) {
        console.error("Error uploading image:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
