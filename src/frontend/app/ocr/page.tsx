"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/organisms/header";
import ImadeUploader from "@/components/molecules/imageUploader";

export default function OCRPage() {
    const [errMessage, setErrMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const API_URL = `http://${process.env.NEXT_PUBLIC_BACKEND_IP}:${process.env.NEXT_PUBLIC_BACKEND_PORT}` || "http://localhost:8080";
    const uniqueHash = crypto.randomUUID(); //used for OCR websocket

    const router = useRouter();
    
    const parseReceipt =  async (file: File) => {
        setIsLoading(true);
        const mutation = `
            mutation ParseReceipt($file: Upload!, $uniqueHash: String!) {
                parseReceipt(file: $file, uniqueHash: $uniqueHash)
            }
        `;

        try {
            // Use FormData to send multipart request per GraphQL multipart upload spec
            const formData = new FormData();
            
            // Add operations field with the mutation and variables structure
            const operations = {
                query: mutation,
                variables: {
                    file: null, // Will be replaced by file upload
                    uniqueHash: uniqueHash
                }
            };
            formData.append('operations', JSON.stringify(operations));
            
            // Add map field to map file position to variable path
            const map = {
                '0': ['variables.file']
            };
            formData.append('map', JSON.stringify(map));
            
            // Add the actual file
            formData.append('0', file);

            const response = await fetch(`${API_URL}/graphql`, {
                method: 'POST',
                body: formData,
            });
            
            const result = await response.json();
            
            if (result.errors) {
                console.error(`GraphQL Error: ${result.errors[0].message}`);
                setErrMessage(`Error: ${result.errors[0].message}`);
                setTimeout(() => setErrMessage(""), 3000);
            } else if (result.data?.parseReceipt) {
                console.log('Receipt uploaded successfully');
                router.push(`/creation?uniqueHash=`+ uniqueHash);
            } else {
                setErrMessage("Failed to parse receipt.");
                setTimeout(() => setErrMessage(""), 3000);
            }
        } catch (err) {
            console.error("Network error occurred.", err);
            setErrMessage("Network error occurred.");
            setTimeout(() => setErrMessage(""), 3000);
        }
        setIsLoading(false);
    }

    return (
    <main className="max-w-2xl mx-auto p-6">
      <Header 
        title="Create Session" 
        subtitle=""
        showBackButton 
        backHref="/" 
      />
        <div> 
            <ImadeUploader
                onImageUpload={parseReceipt}
                isProcessing={isLoading}
            />
        </div>

    </main>
  );
}