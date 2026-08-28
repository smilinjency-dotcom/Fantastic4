import { useState, useRef } from "react";
import { useGameStore } from "@/stores/gameStore";
import { analyzeTrash } from "@/server/ai/vision";

export default function EcoLensModal() {
  const { closeModal, grantXp } = useGameStore();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const scanObject = async () => {
    if (!image) return;
    setIsLoading(true);
    
    const res = await analyzeTrash({
      data: {
        imageBase64: image
      }
    });

    setResult(res.text);
    setIsLoading(false);
    
    if (res.success) {
      grantXp(15);
    }
  };

  return (
    <div className="eq-modal-backdrop">
      <div className="eq-dialogue" style={{ minWidth: "350px", textAlign: "center" }}>
        <div className="eq-speaker">Eco-Lens</div>
        
        {!image ? (
          <div className="py-8">
            <p className="text-muted-foreground mb-4">Upload a photo of real-world waste to identify how to dispose of it properly.</p>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              type="button" 
              className="eq-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <img src={image} alt="Upload" className="max-w-[200px] rounded-md mb-4 border border-input shadow-sm" />
            
            {result ? (
              <div className="bg-muted p-4 rounded-md text-sm text-left mb-4 shadow-inner">
                {result}
              </div>
            ) : (
              <button 
                type="button" 
                className="eq-primary mb-4"
                onClick={scanObject}
                disabled={isLoading}
              >
                {isLoading ? "Scanning..." : "Scan Object"}
              </button>
            )}
            
            {result && (
              <button 
                type="button" 
                className="text-xs text-muted-foreground underline"
                onClick={() => { setImage(null); setResult(null); }}
              >
                Scan another
              </button>
            )}
          </div>
        )}

        <div className="eq-dialogue-actions mt-4">
          <button type="button" className="eq-ghost" onClick={closeModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
